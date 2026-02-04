import { useEffect, useState, useRef } from "react";
import { getHospitals } from "../api/adminApi";
import { getDoctorsData } from "../api/doctorApi";
import { submitOpdForm, checkDuplicate } from "../api/opdApi";
import React from "react";


import NavbarLink from "./Navbar/NavbarLink";
import lottie from "lottie-web";
import Footer from "./Footer/Footer";




// --- Helper Functions ---

/**
 * Parses a time string (e.g., "9:30 AM" or "8:00 PM") into minutes since midnight.
 * @param {string} timeStr The time string to parse.
 * @returns {number} Total minutes from midnight.
 */
const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  const [time, period] = timeStr.split(" ");
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr);
  let minute = parseInt(minuteStr);

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }
  if (period === "AM" && hour === 12) {
    hour = 0; // Midnight
  }
  return hour * 60 + minute;
};

/**
 * Formats total minutes since midnight into a 12-hour time string (e.g., "9:30 AM").
 * @param {number} totalMinutes The total minutes from midnight.
 * @returns {string} A formatted time string.
 */
const formatTime = (totalMinutes) => {
  let hour = Math.floor(totalMinutes / 60);
  let minute = totalMinutes % 60;
  const period = hour >= 12 ? "PM" : "AM";

  if (hour === 0) {
    hour = 12; // 12 AM (Midnight)
  } else if (hour > 12) {
    hour -= 12; // Convert to 12-hour format
  }

  const minuteStr = minute.toString().padStart(2, '0');
  return `${hour}:${minuteStr} ${period}`;
};

/**
 * Generates 3-hour time slots between a start and end time.
 * @param {string} startTimeStr The hospital's start time (e.g., "9:30 AM").
 * @param {string} endTimeStr The hospital's end time (e.g., "8:00 PM").
 * @returns {string[]} An array of formatted time slots.
 */
const generateTimeSlots = (startTimeStr, endTimeStr) => {
  const startMinutes = parseTime(startTimeStr);
  const endMinutes = parseTime(endTimeStr);
  const slotDuration = 3 * 60; // 3 hours in minutes
  const slots = [];

  for (let currentStart = startMinutes; currentStart < endMinutes; currentStart += slotDuration) {
    const currentEnd = currentStart + slotDuration;
    // Ensure the slot's end time does not exceed the hospital's closing time
    const slotEnd = Math.min(currentEnd, endMinutes);

    // Only add the slot if it's valid (end is after start)
    if (slotEnd > currentStart) {
      slots.push(`${formatTime(currentStart)} - ${formatTime(slotEnd)}`);
    }
  }
  return slots;
};

// --- Component ---

const OpdForm = () => {
  const container = useRef(null);

  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const animationInstance = lottie.loadAnimation({
      container: container.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: require("../animations/appointment.json"),
    });

    return () => {
      animationInstance.destroy();
    };
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    contactNumber: "",
    email: "",
    address: "",
    diagnosis: "",
    hospitalId: "",
    hospitalName: "",

    selectedDoctor: "", // Field for selected doctor
    preferredSlot: "", // Field for preferred slot
    appointmentDate: new Date().toISOString().split('T')[0],
  });

  const [hospitals, setHospitals] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]); // State for dynamic time slots

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await getHospitals();
        if (Array.isArray(data)) {
          setHospitals(data);
        } else {
          alert("Error fetching hospital list");
        }
      } catch (error) {
        alert("Error fetching hospital list");
      }
    };
    fetchHospitals();
  }, []);

  /**
 * Generates an array of dates from today until the end of the current week (Saturday).
 */
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)

    // Get days remaining in the current week (up to Saturday)
    for (let i = 0; i <= (6 - dayOfWeek); i++) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + i);

      // Format as YYYY-MM-DD for the backend and "Day, MMM DD" for the user
      dates.push({
        iso: nextDate.toISOString().split('T')[0],
        label: i === 0 ? "Today" : nextDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
      });
    }
    return dates;
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "hospitalId") {
      const selectedHospital = hospitals.find((hospital) => hospital._id === value);

      if (selectedHospital) {
        console.log("Selected Hospital:", selectedHospital);

        const newTimeSlots = generateTimeSlots(
          selectedHospital.hospitalStartTime,
          selectedHospital.hospitalEndTime
        );

        setTimeSlots(newTimeSlots);

        try {
          const allDoctors = await getDoctorsData();
          const hospitalDoctors = allDoctors.filter(
            (doc) => doc.hospitalId === selectedHospital._id
          );

          console.log("Filtered Doctors:", hospitalDoctors);
          setDoctors(hospitalDoctors);
        } catch (err) {
          console.error("Error fetching doctors:", err);
          setDoctors([]);
        }

        console.log(formData);

        // ✅ RESET doctor selection every time a new hospital is chosen
        setFormData((prev) => ({
          ...prev,
          hospitalId: value,
          hospitalName: selectedHospital.username,
          preferredSlot: "",
          selectedDoctor: "", // ensure it's blank
        }));

        // ✅ (Optional) Clear console log until doctor is manually selected
        console.log("Form data after hospital selection reset:", {
          ...formData,
          hospitalId: value,
          hospitalName: selectedHospital.username,
          selectedDoctor: "", // explicitly blank
        });
      }
      else {
        // Clear data when hospital deselected
        setTimeSlots([]);
        setDoctors([]);
        setFormData((prev) => ({
          ...prev,
          hospitalId: "",
          hospitalName: "",
          preferredSlot: "",
          selectedDoctor: "",
        }));



      }
    }
    else if (name === "selectedDoctor") {
      setFormData((prev) => ({
        ...prev,
        selectedDoctor: value, // store selected doctor id
      }));
      console.log("Selected Doctor:", value);

    }
    else {
      // Normal field updates
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const checkIfDuplicateExists = async () => {
    try {
      const duplicateCheck = await checkDuplicate(
        formData.fullName.trim(), // <--- TRIM HERE
        formData.hospitalId
      );
      // Handle response structure safely
      return duplicateCheck?.data?.exists || duplicateCheck?.exists || false;
    } catch (error) {
      console.error("Error checking duplicates:", error);
      return false;
    }
  };

  // In OpdForm.js

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirmBooking = window.confirm("Do you want to book an appointment?");
    if (!confirmBooking) return;

    // Check for duplicate before proceeding
    const isDuplicate = await checkIfDuplicateExists();
    if (isDuplicate) {
      alert("This Full Name already exists. Please use a different name.");
      return;
    }

    // --- Dynamic Time Validation ---
    const selectedHospital = hospitals.find(
      (h) => h._id === formData.hospitalId
    );
    if (!selectedHospital) {
      alert("Invalid hospital selected.");
      return;
    }

    try {
      const response = await submitOpdForm(formData.hospitalId, formData);

      // ✅ DEBUGGING: Log the response to see exactly what is coming back
      console.log("Booking Response:", response);

      // ✅ FIX: Check response.data.appointment OR response.appointment depending on your API wrapper
      // Most likely, the structure is response.data.appointment
      const appointmentData = response?.data?.appointment || response?.appointment;

      if (!appointmentData?._id) {
        throw new Error("Appointment created, but ID missing in response.");
      }

      // Success Message
      alert(response?.data?.message || response?.message || "Appointment booked successfully!");

      // Optional: Reset form or redirect here

    } catch (error) {
      console.error("Booking Error:", error);
      alert(
        error?.response?.data?.message ||
        error.message ||
        "Appointment booking failed"
      );
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-blue-100 to-blue-200 min-h-screen">
      <NavbarLink />
      <div className="appointment bg-blue-100 rounded-[30px] p-[80px_40px_40px_40px] mx-[20px] relative overflow-hidden mt-36 shadow-lg">
        <div className="container mx-auto">
          <div className="flex flex-wrap bg-white rounded-3xl shadow-xl my-[30px] overflow-hidden">
            <div className="w-full lg:w-6/12 p-8">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-blue-700 mb-10">
                  🩺 Appointment Form
                </h2>

                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="flex flex-col">
                    <label
                      htmlFor="hospitalId"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Select Hospital (Admin Username)
                    </label>
                    <select
                      id="hospitalId"
                      name="hospitalId"
                      value={formData.hospitalId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    >
                      <option value="">Select a hospital</option>
                      {hospitals.map((hospital) => (
                        <option key={hospital._id} value={hospital._id}>
                          {hospital.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="preferredSlot"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Which slot do you prefer?
                    </label>
                    <select
                      id="preferredSlot"
                      name="preferredSlot"
                      value={formData.preferredSlot}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                      disabled={!formData.hospitalId} // Disable if no hospital is selected
                    >
                      <option value="">
                        {formData.hospitalId
                          ? "Select a time slot"
                          : "Please select a hospital first"}
                      </option>
                      {timeSlots.map((slot, index) => (
                        <option key={index} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">

                    <label
                      htmlFor="selectedDoctor"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Choose Doctor (Optional)
                    </label>
                    <select
                      id="selectedDoctor"
                      name="selectedDoctor"
                      value={formData.selectedDoctor || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      disabled={!formData.hospitalId}
                    >
                      <option value="">
                        {doctors.length > 0
                          ? "Select a doctor"
                          : "No doctors available for this hospital"}
                      </option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          {doctor.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date
                    </label>
                    <select
                      id="appointmentDate"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    >
                      {getAvailableDates().map((date) => (
                        <option key={date.iso} value={date.iso}>
                          {date.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {Object.keys(formData).map(
                    (key) =>
                      key !== "hospitalId" &&
                      key !== "hospitalName" &&
                      key !== "preferredSlot" &&
                      key !== "selectedDoctor" && (
                        <div key={key} className="flex flex-col">
                          <label
                            htmlFor={key}
                            className="block text-sm font-medium text-gray-700 mb-2 capitalize"
                          >
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </label>
                          <input
                            type={
                              key === "email"
                                ? "email"
                                : key === "age"
                                  ? "number"
                                  : "text"
                            }
                            id={key}
                            name={key}
                            value={formData[key]}
                            onChange={handleChange}
                            placeholder={`Enter ${key
                              .replace(/([A-Z])/g, " $1")
                              .trim()}`}
                            className="border border-solid border-gray-400 border-[2px] w-full px-4 py-3  rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                            required
                          />
                        </div>
                      )
                  )}

                  <button
                    type="submit"
                    className="col-span-1 md:col-span-2 bg-blue-600 hover:bg-blue-700 transition duration-200 text-white font-semibold py-3 px-6 rounded-lg shadow-md mt-2"
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>

            <div className="w-full lg:w-6/12 bg-blue-50 flex items-center justify-center p-8">
              <div className="img max-w-md w-full" ref={container}></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OpdForm;