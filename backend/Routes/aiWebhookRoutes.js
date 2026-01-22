// --- routes/aiWebhookRoutes.js ---
// VERSION: SINGLE INTENT (Handles Phone Number AND Booking)

const express = require("express");
const axios = require("axios");
const router = express.Router();
const mongoose = require("mongoose");

// ====================================================================
// --- CONFIGURATION ---
// ====================================================================
const HOSPITAL_ID = "67dd317314b7277ff78e37b8"; 
const HOSPITAL_NAME = "Apple";

const Admin = require("../model/adminModel"); 
const opdModel = require("../model/opdModel"); 
const PreBooking = require("../model/PreBooking"); 

// ====================================================================
// --- HELPER FUNCTIONS ---
// ====================================================================

const cleanPhoneNumber = (raw) => {
  if (!raw) return "";
  let clean = raw.toString().replace(/\D/g, ""); 
  if (clean.length > 10) return clean.slice(-10);
  return clean;
};

const cleanSlotFormat = (raw) => {
  if (!raw) return "";
  let clean = raw.toString().toLowerCase();
  clean = clean.replace(/\s+to\s+/g, " - ").replace(/p\.?m\.?/g, " PM").replace(/a\.?m\.?/g, " AM");
  if (clean.includes("-") && !clean.includes(" - ")) clean = clean.replace("-", " - ");
  return clean.replace(/\s+/g, " ").toUpperCase().trim();
};

const formatTime = (totalMinutes) => {
  let hour = Math.floor(totalMinutes / 60);
  let minute = totalMinutes % 60;
  const period = hour >= 12 ? "PM" : "AM";
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
};

const generateTimeSlots = (startTimeStr, endTimeStr) => {
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
  const duration = 3 * 60; 
  const slots = [];
  
  for (let s = start; s < end; s += duration) {
    const e = Math.min(s + duration, end);
    if (e > s) slots.push(`${formatTime(s)} - ${formatTime(e)}`);
  }
  return slots;
};

const cleanGender = (raw) => {
    if (!raw) return "Other";
    const lower = raw.toString().toLowerCase();
    if (lower.includes("female") || lower.includes("girl")) return "Female";
    if (lower.includes("male") || lower.includes("boy")) return "Male";
    return "Other";
};

// ====================================================================
// --- MAIN WEBHOOK ---
// ====================================================================

router.post("/webhook", async (req, res) => {
  try {
    const action = req.body.queryResult.action;
    const params = req.body.queryResult.parameters;
    const session = req.body.session;
    const outputContexts = req.body.queryResult.outputContexts || [];

    // ==================================================================
    // --- FLOW A: WELCOME (Ask for Number) ---
    // ==================================================================
    if (action === "input.welcome") {
        return res.json({
            fulfillmentText: `Welcome to ${HOSPITAL_NAME}. To proceed, please say your registered 10-digit mobile number.`
        });
    }

    // ==================================================================
    // --- FLOW B: HANDLE BOOKING (Verify OR Book) ---
    // ==================================================================
    if (action === "handle-booking-logic") {
        const sessionContext = outputContexts.find(c => c.name.endsWith("session-vars"));
        const ctxParams = sessionContext?.parameters || {};

        // --------------------------------------------------------------
        // SCENARIO 1: User just said their Phone Number (VERIFY USER)
        // --------------------------------------------------------------
        if (params.phone_number) {
            const cleanPhone = cleanPhoneNumber(params.phone_number);
            console.log(`🔍 Verifying Phone: ${cleanPhone}`);

            // Check DB
            const user = await PreBooking.findOne({ phoneNumber: cleanPhone });

            if (!user) {
                return res.json({
                    fulfillmentText: `The number ${cleanPhone} is not registered. Please register first. Goodbye.`,
                    outputContexts: [{ name: `${session}/contexts/session-vars`, lifespanCount: 0 }]
                });
            }

            // Generate Slots
            const hospital = await Admin.findById(HOSPITAL_ID);
            const slots = generateTimeSlots(hospital.hospitalStartTime, hospital.hospitalEndTime);
            const slotText = slots.map((s, i) => `${i + 1}. ${s}`).join(", ");

            return res.json({
                fulfillmentText: `Hello ${user.fullName}. Details found. Please select a slot: ${slotText}`,
                outputContexts: [{
                    name: `${session}/contexts/session-vars`,
                    lifespanCount: 50,
                    parameters: {
                        fullName: { name: user.fullName },
                        age: user.age,
                        gender: user.gender,
                        contactNumber: cleanPhone, // Save verified number
                        rawSlots: slots
                    }
                }]
            });
        }

        // --------------------------------------------------------------
        // SCENARIO 2: User is Booking (SLOT SELECTION)
        // --------------------------------------------------------------
        
        // Safety: If we don't have a verified number yet, reject.
        if (!ctxParams.contactNumber && !params.contactNumber) {
             return res.json({ fulfillmentText: "I didn't catch your mobile number. Please say it again." });
        }

        // 1. Ask for Slot (if missing)
        if (!params.preferredSlot && !ctxParams.preferredSlot) {
            return res.json({ 
                fulfillmentText: "Which slot number would you like?",
                outputContexts: [{ name: `${session}/contexts/session-vars`, lifespanCount: 50, parameters: ctxParams }]
            });
        }

        // 2. Ask for Diagnosis (if missing)
        if (!params.diagnosis) {
            const updatedCtx = { ...ctxParams };
            if (params.preferredSlot) updatedCtx.preferredSlot = params.preferredSlot;

            return res.json({
                fulfillmentText: "Got it. What is the reason for your visit?",
                outputContexts: [{ name: `${session}/contexts/session-vars`, lifespanCount: 50, parameters: updatedCtx }]
            });
        }

        // 3. Finalize Booking
        const slotIndex = parseInt(params.preferredSlot || ctxParams.preferredSlot);
        const finalSlot = ctxParams.rawSlots ? ctxParams.rawSlots[slotIndex - 1] : "Slot " + slotIndex;
        const finalName = ctxParams.fullName.name || ctxParams.fullName;
        const finalPhone = ctxParams.contactNumber; 

        try {
            await axios.post(`${process.env.RENDER_EXTERNAL_URL}/api/opd/${HOSPITAL_ID}`, {
                fullName: finalName,
                age: ctxParams.age,
                gender: cleanGender(ctxParams.gender),
                contactNumber: finalPhone,
                diagnosis: params.diagnosis,
                hospitalId: HOSPITAL_ID,
                hospitalName: HOSPITAL_NAME,
                preferredSlot: cleanSlotFormat(finalSlot),
                address: "AI Booking",
                selectedDoctor: null
            });

            return res.json({ 
                fulfillmentText: `Appointment confirmed for ${finalName} at ${finalSlot}. Goodbye.`,
                outputContexts: [{ name: `${session}/contexts/session-vars`, lifespanCount: 0 }]
            });

        } catch (e) {
            console.error(e);
            return res.json({ fulfillmentText: "System error saving appointment." });
        }
    }

    return res.json({ fulfillmentText: "I didn't understand." });

  } catch (error) {
    console.error("Critical Error:", error);
    return res.json({ fulfillmentText: "System error." });
  }
});

module.exports = router;