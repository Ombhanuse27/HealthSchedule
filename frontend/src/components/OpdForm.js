import { useEffect, useState, useRef } from "react";
import { getHospitals } from "../api/adminApi";
import { getDoctorsData } from "../api/doctorApi";
import { submitOpdForm, checkDuplicate } from "../api/opdApi";
import React from "react";

import NavbarLink from "./Navbar/NavbarLink";
import lottie from "lottie-web";
import Footer from "./Footer/Footer";

// --- Helper Functions ---

const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  const [time, period] = timeStr.split(" ");
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

  if (hour === 0) {
    hour = 12; 
  } else if (hour > 12) {
    hour -= 12; 
  }

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
    selectedDoctor: "", 
    preferredSlot: "", 
    appointmentDate: new Date().toISOString().split('T')[0],
  });

  const [hospitals, setHospitals] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]); 

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

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    const dayOfWeek = today.getDay(); 

    for (let i = 0; i <= (6 - dayOfWeek); i++) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + i);

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
          setDoctors(hospitalDoctors);
        } catch (err) {
          setDoctors([]);
        }

        setFormData((prev) => ({
          ...prev,
          hospitalId: value,
          hospitalName: selectedHospital.username,
          preferredSlot: "",
          selectedDoctor: "", 
        }));
      } else {
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
    } else if (name === "selectedDoctor") {
      setFormData((prev) => ({
        ...prev,
        selectedDoctor: value, 
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const checkIfDuplicateExists = async () => {
    try {
      const duplicateCheck = await checkDuplicate(
        formData.fullName.trim(), 
        formData.hospitalId
      );
      return duplicateCheck?.data?.exists || duplicateCheck?.exists || false;
    } catch (error) {
      console.error("Error checking duplicates:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirmBooking = window.confirm("Do you want to book an appointment?");
    if (!confirmBooking) return;

    const isDuplicate = await checkIfDuplicateExists();
    if (isDuplicate) {
      alert("This Full Name already exists. Please use a different name.");
      return;
    }

    const selectedHospital = hospitals.find((h) => h._id === formData.hospitalId);
    if (!selectedHospital) {
      alert("Invalid hospital selected.");
      return;
    }

    try {
      const response = await submitOpdForm(formData.hospitalId, formData);
      const appointmentData = response?.data?.appointment || response?.appointment;

      if (!appointmentData?._id) {
        throw new Error("Appointment created, but ID missing in response.");
      }

      alert(response?.data?.message || response?.message || "Appointment booked successfully!");
    } catch (error) {
      alert(error?.response?.data?.message || error.message || "Appointment booking failed");
    }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-gray-700";
  const labelClass = "block text-sm font-semibold text-gray-600 mb-2";

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen flex flex-col font-sans">
      <NavbarLink />
      
      {/* Main Content Wrapper */}
      <div className="flex-grow pt-28 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        
        <div className="bg-white rounded-[2rem] shadow-2xl max-w-6xl w-full overflow-hidden flex flex-col lg:flex-row border border-gray-100">
          
          {/* Form Section */}
          <div className="w-full lg:w-7/12 p-8 sm:p-12">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
                Book an Appointment
              </h2>
              <p className="text-gray-500">Fill in the details below to schedule your visit.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              
              <div className="flex flex-col col-span-1 md:col-span-2">
                <label htmlFor="hospitalId" className={labelClass}>
                  Select Hospital
                </label>
                <select
                  id="hospitalId"
                  name="hospitalId"
                  value={formData.hospitalId}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Select a hospital...</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital._id} value={hospital._id}>
                      {hospital.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label htmlFor="appointmentDate" className={labelClass}>
                  Select Date
                </label>
                <select
                  id="appointmentDate"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  {getAvailableDates().map((date) => (
                    <option key={date.iso} value={date.iso}>
                      {date.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label htmlFor="preferredSlot" className={labelClass}>
                  Preferred Slot
                </label>
                <select
                  id="preferredSlot"
                  name="preferredSlot"
                  value={formData.preferredSlot}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  disabled={!formData.hospitalId} 
                >
                  <option value="">
                    {formData.hospitalId ? "Select a time slot" : "Select a hospital first"}
                  </option>
                  {timeSlots.map((slot, index) => (
                    <option key={index} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col col-span-1 md:col-span-2">
                <label htmlFor="selectedDoctor" className={labelClass}>
                  Choose Doctor (Optional)
                </label>
                <select
                  id="selectedDoctor"
                  name="selectedDoctor"
                  value={formData.selectedDoctor || ""}
                  onChange={handleChange}
                  className={inputClass}
                  disabled={!formData.hospitalId}
                >
                  <option value="">
                    {doctors.length > 0 ? "Any available doctor" : "No doctors available"}
                  </option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Inputs */}
              {Object.keys(formData).map(
                (key) =>
                  key !== "hospitalId" &&
                  key !== "hospitalName" &&
                  key !== "preferredSlot" &&
                  key !== "selectedDoctor" &&
                  key !== "appointmentDate" && ( // EXCLUDED duplicate date field here
                    <div key={key} className={`flex flex-col ${key === 'address' || key === 'diagnosis' ? 'col-span-1 md:col-span-2' : ''}`}>
                      <label htmlFor={key} className={`${labelClass} capitalize`}>
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <input
                        type={key === "email" ? "email" : key === "age" ? "number" : "text"}
                        id={key}
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        placeholder={`Enter ${key.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                        className={inputClass}
                        required={key !== "diagnosis"} // made diagnosis optional as an example, adjust if needed
                      />
                    </div>
                  )
              )}

              <div className="col-span-1 md:col-span-2 mt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-lg"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>

          {/* Lottie Animation Section */}
          <div className="w-full lg:w-5/12 bg-blue-50 flex flex-col items-center justify-center p-8 border-l border-blue-100">
             <div className="text-center mb-8 lg:mb-12">
                <h3 className="text-2xl font-bold text-blue-800">Fast & Secure</h3>
                <p className="text-blue-600/80 mt-2">Skip the queue by booking online.</p>
             </div>
            <div className="img max-w-sm w-full drop-shadow-xl" ref={container}></div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OpdForm;