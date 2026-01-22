// --- routes/aiWebhookRoutes.js ---
// VERSION: PRODUCTION (Dynamic Caller ID + Persistent Slot Memory)

const express = require("express");
const axios = require("axios");
const router = express.Router();
const mongoose = require("mongoose");

// ====================================================================
// --- 1. SET YOUR MANUAL VALUES HERE ---
// ====================================================================
const HOSPITAL_ID = "67dd317314b7277ff78e37b8"; 
const HOSPITAL_NAME = "Apple";

// --- 2. CHECK YOUR MODEL PATHS ---
// (Ensure these paths match your folder structure exactly)
const Admin = require("../model/adminModel"); 
const opdModel = require("../model/opdModel"); 
const PreBooking = require("../model/PreBooking"); 
// ====================================================================

// --- CLEANING FUNCTIONS ---

const cleanGender = (raw) => {
  if (!raw) return "Other";
  const lower = raw.toString().toLowerCase();
  if (lower.includes("female") || lower.includes("girl") || lower.includes("woman")) return "Female";
  if (lower.includes("male") || lower.includes("boy") || lower.includes("man") || lower.includes("made")) return "Male";
  return "Other";
};

// ✅ HELPER: Extracts last 10 digits (Removes +91, 0, etc.)
const cleanPhoneNumber = (raw) => {
  if (!raw) return "";
  let clean = raw.toString().replace(/\D/g, ""); // Remove non-digits
  if (clean.length > 10) {
      return clean.slice(-10); // Take last 10 (e.g., 91826... -> 826...)
  }
  return clean;
};

const cleanSlotFormat = (raw) => {
  if (!raw) return "";
  let clean = raw.toString().toLowerCase();
  clean = clean.replace(/\s+to\s+/g, " - ");
  clean = clean.replace(/p\.?m\.?/g, " PM").replace(/a\.?m\.?/g, " AM");
  if (clean.includes("-") && !clean.includes(" - ")) {
      clean = clean.replace("-", " - ");
  }
  return clean.replace(/\s+/g, " ").toUpperCase().trim();
};

// --- TIME SLOT GENERATION HELPERS ---
const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  const [time, period] = timeStr.trim().split(/\s+/); 
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr);
  let minute = parseInt(minuteStr);
  
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return hour * 60 + minute;
};

const formatTime = (totalMinutes) => {
  let hour = Math.floor(totalMinutes / 60);
  let minute = totalMinutes % 60;
  const period = hour >= 12 ? "PM" : "AM";
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  const minuteStr = minute.toString().padStart(2, '0');
  return `${hour}:${minuteStr} ${period}`;
};

const generateTimeSlots = (startTimeStr, endTimeStr) => {
  const startMinutes = parseTime(startTimeStr);
  const endMinutes = parseTime(endTimeStr);
  const slotDuration = 3 * 60; 
  const slots = [];
  for (let currentStart = startMinutes; currentStart < endMinutes; currentStart += slotDuration) {
    const currentEnd = currentStart + slotDuration;
    const slotEnd = Math.min(currentEnd, endMinutes);
    if (slotEnd > currentStart) {
      slots.push(`${formatTime(currentStart)} - ${formatTime(slotEnd)}`);
    }
  }
  return slots;
};

const checkDuplicateLogic = async (fullName, hospitalId) => {
  try {
    const now = new Date();
    const todayIST = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const todayDate = todayIST.toISOString().split("T")[0]; 
    const existingEntry = await opdModel.findOne({
      fullName,
      hospitalId,
      appointmentDate: todayDate,
    });
    return existingEntry ? true : false;
  } catch (error) {
    console.error("Webhook Error checking duplicates:", error);
    return false;
  }
};

// ====================================================================
// --- REGISTRATION API (Called by Frontend) ---
// ====================================================================
router.post("/register-call-intent", async (req, res) => {
  try {
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

// ====================================================================
// --- MAIN WEBHOOK ROUTE (Called by Dialogflow) ---
// ====================================================================

router.post("/webhook", async (req, res) => {
  try {
    const action = req.body.queryResult.action;
    const params = req.body.queryResult.parameters;
    const session = req.body.session;
    const outputContexts = req.body.queryResult.outputContexts || [];

    // --- 🔍 1. DYNAMIC CALLER ID DETECTION ---
    const originalPayload = req.body.originalDetectIntentRequest?.payload;
    const rawCallerId = originalPayload?.telephony?.caller_id || ""; 
    const callerPhone = cleanPhoneNumber(rawCallerId);

    console.log("------------------------------------------------"); 
    console.log(`🔍 INCOMING CALL:`);
    console.log(`   - Raw Caller ID: '${rawCallerId}'`);
    console.log(`   - Cleaned Phone: '${callerPhone}'`);
    console.log(`   - Action: ${action}`);
    console.log("------------------------------------------------");

    // ==================================================================
    // --- FLOW A: WELCOME (CHECK DB FOR CALLER) ---
    // ==================================================================
    if (action === "input.welcome") {
        
        // ❌ REJECT: If testing in Browser (No Phone Number)
        if (!callerPhone) {
             console.log("❌ REJECTED: No phone number detected (Browser/Console Test).");
             return res.json({
                fulfillmentText: `I cannot identify your phone number. This usually happens when testing in the browser. Please call from a real phone to test the booking system.`
            });
        }

        // ✅ CHECK DATABASE: Dynamic Lookup
        // We look for specifically THIS caller in the PreBooking table
        const preBooking = await PreBooking.findOne({ phoneNumber: callerPhone });

        // ❌ REJECT: Number not found in DB
        if (!preBooking) {
            console.log(`❌ REJECTED: Number ${callerPhone} not found in DB.`);
            return res.json({
                fulfillmentText: `I'm sorry, your number is not registered for ${HOSPITAL_NAME}. Please visit our website to book. Goodbye.`,
                outputContexts: [{ name: `${session}/contexts/session-vars`, lifespanCount: 0 }] 
            });
        }

        console.log(`✅ Welcome: User identified as ${preBooking.fullName}`);

        // 🟢 SUCCESS: User Found -> Generate Slots
        const hospital = await Admin.findById(HOSPITAL_ID);
        const slots = generateTimeSlots(hospital.hospitalStartTime, hospital.hospitalEndTime);
        const numberedSlots = slots.map((s, index) => `${index + 1}. ${s}`).join(", ");

        // Save User Data to Context (Memory)
        return res.json({
            fulfillmentText: `Hello ${preBooking.fullName}. Welcome to ${HOSPITAL_NAME}. The available slots are: ${numberedSlots}. Please say the slot number you prefer.`,
            outputContexts: [
                {
                    name: `${session}/contexts/session-vars`,
                    lifespanCount: 50,
                    parameters: {
                        fullName: { name: preBooking.fullName }, // Save Name
                        age: preBooking.age,                     // Save Age
                        gender: preBooking.gender,               // Save Gender
                        contactNumber: callerPhone,              // Save Phone
                        rawSlots: slots 
                    }
                }
            ]
        });
    }

    // ==================================================================
    // --- FLOW B: BOOKING LOGIC ---
    // ==================================================================
    if (action === "handle-booking-logic") {
      const sessionContext = outputContexts.find(ctx => ctx.name.endsWith("session-vars"));
      const contextParams = sessionContext?.parameters || {};

      // 1. Ask for Slot (If missing)
      if (!params.preferredSlot && !contextParams.preferredSlot) {
        const hospital = await Admin.findById(HOSPITAL_ID);
        const slots = generateTimeSlots(hospital.hospitalStartTime, hospital.hospitalEndTime);
        const numberedSlots = slots.map((s, index) => `${index + 1}. ${s}`).join(", ");
        return res.json({
          fulfillmentText: `Please select a time. Our available slots are: ${numberedSlots}.`, 
          outputContexts: [{ name: `${session}/contexts/session-vars`, lifespanCount: 50, parameters: { ...contextParams, rawSlots: slots } }]
        });
      }
      
      // 2. Finalize Booking (We have Slot + Diagnosis)
      else if (params.diagnosis) {
        
        // Retrieve Name from Context (Memory)
        let rawName = contextParams.fullName || params.fullName;
        if (typeof rawName === 'object') rawName = rawName.name; 
        
        // Emergency Fallback: If context lost, check DB again
        if (!rawName) {
            const emergencyLookup = await PreBooking.findOne({ phoneNumber: callerPhone });
            if (emergencyLookup) {
                 rawName = emergencyLookup.fullName;
                 contextParams.age = emergencyLookup.age;
                 contextParams.gender = emergencyLookup.gender;
            }
        }

        const age = contextParams.age || params.age;
        const rawGender = contextParams.gender || params.gender;
        const preferredSlot = cleanSlotFormat(params.preferredSlot || contextParams.preferredSlot);

        // Map Slot "1" -> "12:00 PM"
        let finalSlotName = preferredSlot;
        if (contextParams.rawSlots) {
             const slotIndex = parseInt(preferredSlot);
             if (!isNaN(slotIndex) && slotIndex > 0) {
                 finalSlotName = contextParams.rawSlots[slotIndex - 1] || preferredSlot;
             }
        }

        // Check for Double Booking
        const isDuplicate = await checkDuplicateLogic(rawName, HOSPITAL_ID);
        if (isDuplicate) {
          return res.json({
            fulfillmentText: `I'm sorry, an appointment for ${rawName} already exists today.`,
            outputContexts: [{ name: `${session}/contexts/session-vars`, lifespanCount: 0 }] 
          });
        }

        // Save to Database
        const formData = {
          fullName: rawName, 
          age, 
          gender: cleanGender(rawGender), 
          contactNumber: callerPhone,
          diagnosis: params.diagnosis, 
          hospitalId: HOSPITAL_ID, 
          hospitalName: HOSPITAL_NAME,
          preferredSlot: cleanSlotFormat(finalSlotName), 
          address: "AI Booking", 
          email: null, 
          selectedDoctor: null
        };

        try {
          await axios.post(`${process.env.RENDER_EXTERNAL_URL}/api/opd/${HOSPITAL_ID}`, formData);
          return res.json({
            fulfillmentText: `Appointment confirmed for ${rawName} at ${finalSlotName}. Thank you. Goodbye.`,
            outputContexts: [{ name: `${session}/contexts/session-vars`, lifespanCount: 0 }] 
          });
        } catch (e) {
          console.error(e);
          return res.json({ fulfillmentText: "System error saving appointment." });
        }
      }
      
      // 3. Intermediate: User gave Slot, now ask Diagnosis
      else {
        // Save the Slot user just said into Context
        const updatedParams = { ...contextParams };
        if (params.preferredSlot) updatedParams.preferredSlot = params.preferredSlot;
        
        return res.json({
            fulfillmentText: "Thank you. Finally, what is the reason for your visit?",
            outputContexts: [{ name: `${session}/contexts/session-vars`, lifespanCount: 50, parameters: updatedParams }]
        });
      }
    } 

    return res.json({ fulfillmentText: "I didn't quite get that." });

  } catch (error) {
      console.error("Webhook Critical Error:", error);
      return res.json({ fulfillmentText: "System error. Please call back." });
  }
});

module.exports = router;