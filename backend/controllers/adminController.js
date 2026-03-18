const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../model/adminModel");
const Doctor = require("../model/Doctor");
const opdModel = require("../model/opdModel");

require("dotenv").config();

// ======================
// Health / Cron
// ======================
exports.getCron = (req, res) => {
  res.status(200).send("Cron ping successful at " + new Date().toISOString());
};

// ======================
// Admin Registration
// ======================
exports.registerAdmin = async (req, res) => {
  try {
    const { username, password, address, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    existingEmail = await Admin.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const existingAdmin = await Admin.findOne({ username});
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      username,
      password: hashedPassword,
      address,
      email
    });

    newAdmin.hospitalId = newAdmin._id.toString(); // ✅ fix — assign before save


    await newAdmin.save();


    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// Admin Login
// ======================
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "7h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// Get All Hospitals
// ======================
exports.getHospitals = async (req, res) => {
  try {
    const admins = await Admin.find({}).select("-password");
    res.json(admins);
  } catch (err) {
    console.error("Error fetching admins:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// Get Logged-in Admin
// ======================
exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// Assign Doctor to OPD
// ======================
exports.assignDoctor = async (req, res) => {
  const { recordId, doctorId } = req.body;

  if (!recordId || !doctorId) {
    return res
      .status(400)
      .json({ message: "recordId and doctorId are required." });
  }

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    const appointment = await opdModel.findById(recordId);
    if (!appointment) {
      return res
        .status(404)
        .json({ message: "Appointment record not found." });
    }

    appointment.assignedDoctor = doctorId;
    await appointment.save();

    if (!doctor.assignedAppointments?.includes(recordId)) {
      doctor.assignedAppointments = doctor.assignedAppointments || [];
      doctor.assignedAppointments.push(recordId);
      await doctor.save();
    }

    res
      .status(200)
      .json({ message: "Doctor successfully assigned to appointment." });
  } catch (error) {
    console.error("Error assigning doctor:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
