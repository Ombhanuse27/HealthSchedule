// --- routes/aiWebhookRoutes.js ---
// VERSION: FINAL SECURE (Whitelisted Numbers Only + Persistent Slot Memory)

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

const cleanPhoneNumber = (raw) => {
  if (!raw) return "";
  let clean = raw.toString().replace(/\D/g, ""); 
  return clean.slice(-10);
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
// --- NEW: API TO REGISTER INTENT (Called by React Frontend) ---
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
// --- MAIN WEBHOOK ROUTE ---
// ====================================================================

router.post("/webhook", async (req, res) => {
  try {
    const action = req.body.queryResult.action;
    const params = req.body.queryResult.parameters;
    const session = req.body.session;
    const outputContexts = req.body.queryResult.outputContexts || [];

    // 1. EXTRACT CALLER ID
    const originalPayload = req.body.originalDetectIntentRequest?.payload;
    const rawCallerId = originalPayload?.telephony?.caller_id || ""; // Works for Dialogflow Phone Gateway
    const callerPhone = cleanPhoneNumber(rawCallerId);

    console.log(`AI Webhook: Action=${action} | Caller=${callerPhone}`); 

    // ==================================================================
    // --- FLOW A: WELCOME (STRICT WHITELIST CHECK) ---
    // ==================================================================
    if (action === "input.welcome") {
        
        // 🔒 SECURITY CHECK: Only allow if number exists in PreBooking
        const preBooking = await PreBooking.findOne({ phoneNumber: callerPhone });

        if (!preBooking) {
            console.log(`❌ Rejected Unknown Caller: ${callerPhone}`);
            return res.json({
                fulfillmentText: `I'm sorry, your number is not registered for ${HOSPITAL_NAME}. Please visit our website to book your appointment. Goodbye.`,
                outputContexts: [{ name: `${session}/contexts/session-vars`, lifespanCount: 0 }] 
            });
        }

        console.log(`✅ Welcome: User identified as ${preBooking.fullName}`);

        // Generate Slots
        const hospital = await Admin.findById(HOSPITAL_ID);
        const slots = generateTimeSlots(hospital.hospitalStartTime, hospital.hospitalEndTime);
        const numberedSlots = slots.map((s, index) => `${index + 1}. ${s}`).join(", ");

        // Save DB Data to Context so we don't need to ask again
        return res.json({
            fulfillmentText: `Hello ${preBooking.fullName}. Welcome to ${HOSPITAL_NAME}. The available slots are: ${numberedSlots}. Please say the slot number you prefer.`,
            outputContexts: [
                {
                    name: `${session}/contexts/session-vars`,
                    lifespanCount: 50,
                    parameters: {
                        fullName: { name: preBooking.fullName },
                        age: preBooking.age,
                        gender: preBooking.gender,
                        contactNumber: callerPhone,
                        rawSlots: slots // Save slots for mapping later
                    }
                }
            ]
        });
    }

    // ==================================================================
    // --- FLOW B: BOOKING LOGIC ---
    // ==================================================================
    if (action === "handle-booking-logic") {

      // 1. Retrieve Existing Session Data
      const sessionContext = outputContexts.find(ctx => ctx.name.endsWith("session-vars"));
      const contextParams = sessionContext?.parameters || {};

      // --- STEP 1: Ask for Slot if missing ---
      if (!params.preferredSlot && !contextParams.preferredSlot) {
        const hospital = await Admin.findById(HOSPITAL_ID);
        const slots = generateTimeSlots(hospital.hospitalStartTime, hospital.hospitalEndTime);
        const numberedSlots = slots.map((s, index) => `${index + 1}. ${s}`).join(", ");
        
        return res.json({
          fulfillmentText: `Please select a time. Our available slots are: ${numberedSlots}.`, 
          outputContexts: [
            {
              name: `${session}/contexts/session-vars`,
              lifespanCount: 50,
              parameters: { ...contextParams, rawSlots: slots }
            }
          ]
        });
      }
      
      // --- STEP 2: FINALIZE (We have Slot + Diagnosis) ---
      else if (params.diagnosis) {
        console.log("AI Webhook: Finalizing Booking...");
        
        let rawName = contextParams.fullName || params.fullName;
        if (typeof rawName === 'object') rawName = rawName.name; 

        // Emergency Fallback Lookup
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
        const rawPhone = contextParams.contactNumber || params.contactNumber || callerPhone; 
        
        // 🔹 RESOLVE SLOT: Try current params, fallback to session context
        let resolvedSlot = params.preferredSlot || contextParams.preferredSlot;
        
        // Map "1", "2" to "12:00 PM - 3:00 PM" using context
        if (contextParams.rawSlots) {
            const slotIndex = parseInt(resolvedSlot); 
            if (!isNaN(slotIndex) && slotIndex > 0) {
                const mappedSlot = contextParams.rawSlots[slotIndex - 1];
                if (mappedSlot) resolvedSlot = mappedSlot;
            }
        }

        // Clean Data
        const fullName = rawName || "Guest Patient"; 
        const gender = cleanGender(rawGender); 
        const contactNumber = cleanPhoneNumber(rawPhone); 
        const preferredSlot = cleanSlotFormat(resolvedSlot);

        console.log("Booking Data:", { fullName, age, gender, preferredSlot, contactNumber });

        // Duplicate Check
        const isDuplicate = await checkDuplicateLogic(fullName, HOSPITAL_ID);
        if (isDuplicate) {
          return res.json({
            fulfillmentText: `I'm sorry, an appointment for ${fullName} already exists today.`,
            outputContexts: [{ name: `${session}/contexts/session-vars`, lifespanCount: 0 }] 
          });
        }

        // Save to Database
        const formData = {
          fullName, age, gender, contactNumber,
          email: null, address: "Booked via AI Agent",
          diagnosis: params.diagnosis, 
          hospitalId: HOSPITAL_ID,
          hospitalName: HOSPITAL_NAME,
          selectedDoctor: null,
          preferredSlot, 
        };

        let speech = "";
        try {
          await axios.post(`${process.env.RENDER_EXTERNAL_URL}/api/opd/${HOSPITAL_ID}`, formData);
          speech = `Appointment confirmed for ${fullName} at ${preferredSlot}. Thank you. Goodbye.`;
        } catch (apiError) {
          console.error("API Error:", apiError.response?.data || apiError.message);
          speech = "I'm sorry, we couldn't save the appointment in the system. Please try again.";
        }

        return res.json({
          fulfillmentText: speech,
          outputContexts: [{ name: `${session}/contexts/session-vars`, lifespanCount: 0 }] 
        });
      }
      
      // --- STEP 3: INTERMEDIATE (User gave Slot, now ask Diagnosis) ---
      else {
        // 🔹 CRITICAL FIX: Save the slot the user just said into Context
        // This ensures we remember "Slot 5" when we come back with the Diagnosis
        const updatedParams = { ...contextParams };
        if (params.preferredSlot) {
            updatedParams.preferredSlot = params.preferredSlot;
        }

        return res.json({
            fulfillmentText: "Thank you. Finally, what is the reason for your visit?",
            outputContexts: [{ 
                name: `${session}/contexts/session-vars`, 
                lifespanCount: 50, 
                parameters: updatedParams 
            }]
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