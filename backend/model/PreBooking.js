// model/PreBooking.js
const mongoose = require("mongoose");

const preBookingSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true }, // The "Key" (Caller ID)
  fullName: { type: String, required: true },
  age: { type: String, required: true },
  gender: { type: String, required: true },
  hospitalId: { type: String, required: true },
  hospitalName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now } // Auto-delete after 24 hours
});

module.exports = mongoose.model("PreBooking", preBookingSchema);