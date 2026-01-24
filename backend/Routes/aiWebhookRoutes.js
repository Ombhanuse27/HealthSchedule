// --- routes/aiWebhookRoutes.js ---
const express = require("express");
const axios = require("axios");
const router = express.Router();
const moment = require("moment"); // Recommended: npm install moment

// MODELS
const Admin = require("../model/adminModel");
const PreBooking = require("../model/PreBooking");

// CONFIG
const HOSPITAL_ID = "67dd317314b7277ff78e37b8"; 

// ====================================================================
// --- HELPER FUNCTIONS ---
// ====================================================================

const cleanPhoneNumber = (raw) => {
  if (!raw) return "";
  
  // Ensure input is a string
  const inputString = raw.toString();
  
  // Regex: \D matches anything that is NOT a digit (hyphens, spaces, parens)
  let clean = inputString.replace(/\D/g, ""); 
  
  // Handle country code (remove leading 91 or 1 if length > 10)
  if (clean.length > 10) clean = clean.slice(-10);

  console.log(`Format Check: Input '${inputString}' converted to '${clean}'`);
  return clean;
};


router.post("/register-call-intent", async (req, res) => {

  try {

    // We accept Name, Age, Gender, Phone from Website
    const { fullName, contactNumber, age, gender } = req.body;
    const cleanPhone = cleanPhoneNumber(contactNumber);
    await PreBooking.findOneAndUpdate(
      { phoneNumber: cleanPhone },
      { 
        fullName, 
        age,
        gender,
        hospitalId: HOSPITAL_ID, 
        hospitalName: HOSPITAL_NAME,
        createdAt: new Date() 
      },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, message: "Registered successfully" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Generates slots and checks if they are valid/passed
const getSlotsWithStatus = (startTimeStr, endTimeStr) => {
  const parseTime = (t) => {
    const [time, period] = t.trim().split(/\s+/);
    const [h, m] = time.split(":");
    let hour = parseInt(h);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return hour * 60 + parseInt(m);
  };

  const start = parseTime(startTimeStr);
  const end = parseTime(endTimeStr);
  const duration = 180; // 3 hours in minutes
  const slots = [];

  // Get current time in minutes for comparison (assuming Hospital timezone)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let s = start; s < end; s += duration) {
    const e = Math.min(s + duration, end);
    if (e > s) {
      const format = (min) => {
        let h = Math.floor(min / 60);
        let m = min % 60;
        const p = h >= 12 ? "PM" : "AM";
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        return `${h}:${m.toString().padStart(2, '0')} ${p}`;
      };
      
      // Logic: A slot is "passed" if the END time of the slot is before right now
      // Example: Slot 9-12. Now is 1pm (13:00). Slot end (12:00) < Now.
      const isPassed = e <= currentMinutes; 
      
      slots.push({
        text: `${format(s)} - ${format(e)}`,
        isValid: !isPassed
      });
    }
  }
  return slots;
};

// ====================================================================
// --- MAIN WEBHOOK ---
// ====================================================================

router.post("/webhook", async (req, res) => {
  try {
    const action = req.body.queryResult.action;
    const params = req.body.queryResult.parameters;
    const session = req.body.session;
    
    // Helper to get session variables from Context
    const getContext = (name) => {
       const ctx = req.body.queryResult.outputContexts || [];
       return ctx.find(c => c.name.endsWith(name));
    };

    // --------------------------------------------------------------
    // STEP 1: WELCOME -> Ask for Number
    // --------------------------------------------------------------
    if (action === "input.welcome") {
        return res.json({
            fulfillmentText: "Welcome to Apple Hospital AI. Please tell me your registered mobile number to proceed.",
            outputContexts: [
                { name: `${session}/contexts/awaiting_phone`, lifespanCount: 2 }
            ]
        });
    }

    // --------------------------------------------------------------
    // STEP 2: CHECK PHONE -> Verify PreBooking -> Show Slots
    // --------------------------------------------------------------
    if (action === "check_phone") {
        const phoneInput = params.phone_number || params.contactNumber;
        const cleanPhone = cleanPhoneNumber(phoneInput);
        
        console.log(`Checking Phone: ${cleanPhone}`);

        // 1. Check PreBooking DB
        const user = await PreBooking.findOne({ phoneNumber: cleanPhone });

        if (!user) {
            return res.json({
                fulfillmentText: `I couldn't find a registration for ${cleanPhone}. Please register with the reception first.`,
                outputContexts: [] // Clear contexts
            });
        }

        // 2. Generate Slots
        const hospital = await Admin.findById(HOSPITAL_ID);
        // Fallback times if DB is empty
        const start = hospital?.hospitalStartTime || "09:00 AM";
        const end = hospital?.hospitalEndTime || "09:00 PM";
        
        const allSlots = getSlotsWithStatus(start, end);
        
        // Filter out passed slots for display, or just mark them? 
        // Let's show all but tell them which are available.
        // To make it easy for user, let's list them: "1. 9-12 (Expired), 2. 12-3 (Available)"
        
        let validSlotsCount = 0;
        const slotText = allSlots.map((s, i) => {
            if(s.isValid) validSlotsCount++;
            return `${i + 1}. ${s.text} ${s.isValid ? "" : "(Passed)"}`;
        }).join("\n");

        if (validSlotsCount === 0) {
            return res.json({
                fulfillmentText: `Welcome ${user.fullName}. Unfortunately, no slots are available for today as hospital hours are over.`
            });
        }

        return res.json({
            fulfillmentText: `Welcome ${user.fullName}. Please select a time slot number:\n${slotText}`,
            outputContexts: [
                { 
                    name: `${session}/contexts/session_vars`, 
                    lifespanCount: 50, 
                    parameters: { 
                        fullName: user.fullName,
                        age: user.age,
                        gender: user.gender,
                        contactNumber: cleanPhone,
                        generatedSlots: allSlots // Passing the array to next step
                    }
                },
                { name: `${session}/contexts/awaiting_slot`, lifespanCount: 2 }
            ]
        });
    }

    // --------------------------------------------------------------
    // STEP 3: SELECT SLOT -> Validate -> Ask Diagnosis
    // --------------------------------------------------------------
    if (action === "select_slot") {
        const sessionCtx = getContext("session_vars");
        if (!sessionCtx) return res.json({ fulfillmentText: "Session expired. Please start over." });

        const slotIndex = parseInt(params.slot_sequence) - 1; // User says "1", array is 0
        const slots = sessionCtx.parameters.generatedSlots;

        // Validation 1: Exists
        if (!slots || !slots[slotIndex]) {
            return res.json({ 
                fulfillmentText: "That is not a valid slot number. Please choose from the list.",
                outputContexts: [{ name: `${session}/contexts/awaiting_slot`, lifespanCount: 2 }] 
            });
        }

        // Validation 2: Time Check
        const selectedSlot = slots[slotIndex];
        if (!selectedSlot.isValid) {
            return res.json({ 
                fulfillmentText: `The slot ${selectedSlot.text} has already passed. Please choose a future slot.`,
                outputContexts: [{ name: `${session}/contexts/awaiting_slot`, lifespanCount: 2 }] 
            });
        }

        // Valid Slot Selected
        return res.json({
            fulfillmentText: `You selected ${selectedSlot.text}. Finally, please tell me the reason for your visit (Diagnosis).`,
            outputContexts: [
                { 
                    name: `${session}/contexts/session_vars`, 
                    lifespanCount: 50, 
                    parameters: { 
                        ...sessionCtx.parameters,
                        finalSlot: selectedSlot.text 
                    }
                },
                { name: `${session}/contexts/awaiting_diagnosis`, lifespanCount: 2 }
            ]
        });
    }

    // --------------------------------------------------------------
    // STEP 4: BOOK APPOINTMENT
    // --------------------------------------------------------------
    if (action === "book_appointment") {
        const sessionCtx = getContext("session_vars");
        const rawUserText = req.body.queryResult.queryText; 
        const diagnosis = params.diagnosis || rawUserText;

        if (!sessionCtx) return res.json({ fulfillmentText: "Error: Session lost." });

        const data = sessionCtx.parameters;

        // Perform Booking
        try {
            
            await axios.post(`${process.env.RENDER_EXTERNAL_URL}/opd/${HOSPITAL_ID}`, {
                fullName: data.fullName,
                age: data.age,
                gender: data.gender, // Ensure your API handles "Male"/"Female" strings
                contactNumber: data.contactNumber,
                diagnosis: diagnosis,
                hospitalId: HOSPITAL_ID,
                hospitalName: "Apple Hospital",
                preferredSlot: data.finalSlot,
                address: "AI Booking",
                selectedDoctor: null
            });

            return res.json({
                fulfillmentText: `Done! Appointment confirmed for ${data.fullName} at ${data.finalSlot} for ${diagnosis}. Take care!`,
                outputContexts: [{ name: `${session}/contexts/session_vars`, lifespanCount: 0 }] // End session
            });

        } catch (e) {
            console.error("Booking API Error", e.message);
            return res.json({ fulfillmentText: "I'm having trouble connecting to the server. Please try again later." });
        }
    }

    // Default Fallback
    res.json({ fulfillmentText: "I'm sorry, I didn't understand that." });

  } catch (error) {
    console.error("Critical Webhook Error:", error);
    res.json({ fulfillmentText: "System error occurred." });
  }
});

module.exports = router;