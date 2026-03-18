const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  opdForms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'opdModel' }],
  hospitalImage: { type: String, default: "" },
  hospitalId:{ type: String},
  hospitalName: { type: String },
  hospitalStartTime: { type: String},
  hospitalEndTime: { type: String },
  Specialist: { type: String },
  opdFees: { type: Number },
  contactNumber: { type: String},
  emergencyContact: { type: String },
  email: { type: String},
  address: { type: String },
  paymentMode: { type: String},
  aboutHospital: { type: String },
  numberOfBeds: { type: Number },
  accreditations: { type: String },
  website: { type: String },
  city: { type: String }, 
  facilities: { type: String }, 
  insuranceAccepted: { type: String },
  experience: { type: String }
});

module.exports = mongoose.model("adminModel", AdminSchema);
