import { useEffect, useState, useRef } from "react";
import { getHospitals } from "../api/adminApi";
import { getDoctorsData } from "../api/doctorApi";
import { submitOpdForm, checkDuplicate } from "../api/opdApi";
import React from "react";

import NavbarLink from "./Navbar/NavbarLink";
import lottie from "lottie-web";
import Footer from "./Footer/Footer";

// --- Helper Functions (Logic Untouched) ---

// Safely gets YYYY-MM-DD in local time, ignoring UTC offsets
const getLocalISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

// --- Component ---

const OpdForm = () => {
  const container = useRef(null);
  const [doctors, setDoctors] = useState([]);

  // --- Custom Modal State ---
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "none", // 'confirm', 'loading', 'success', 'error'
    message: "",
  });

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
    appointmentDate: getLocalISODate(new Date()),
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
          setModalState({ isOpen: true, type: "error", message: "Error fetching hospital list." });
        }
      } catch (error) {
        setModalState({ isOpen: true, type: "error", message: "Error fetching hospital list." });
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
        iso: getLocalISODate(nextDate),
        label: i === 0 ? "Today" : nextDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
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
          console.error("Error fetching doctors:", err);
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
      setFormData((prev) => ({ ...prev, selectedDoctor: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const checkIfDuplicateExists = async () => {
    try {
      const duplicateCheck = await checkDuplicate(formData.fullName.trim(), formData.hospitalId);
      return duplicateCheck?.data?.exists || duplicateCheck?.exists || false;
    } catch (error) {
      console.error("Error checking duplicates:", error);
      return false;
    }
  };

  // --- UI Logic: Triggers Modal instead of native window.confirm ---
  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setModalState({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to book this appointment?",
    });
  };

  // --- Core Submit Logic (Untouched, just wrapped in modal state updates) ---
  const executeBooking = async () => {
    setModalState({ isOpen: true, type: "loading", message: "Processing your appointment..." });

    const isDuplicate = await checkIfDuplicateExists();
    if (isDuplicate) {
      setModalState({ isOpen: true, type: "error", message: "This Full Name already exists. Please use a different name." });
      return;
    }

    const selectedHospital = hospitals.find((h) => h._id === formData.hospitalId);
    if (!selectedHospital) {
      setModalState({ isOpen: true, type: "error", message: "Invalid hospital selected." });
      return;
    }

    try {
      const response = await submitOpdForm(formData.hospitalId, formData);
      const appointmentData = response?.data?.appointment || response?.appointment;

      if (!appointmentData?._id) {
        throw new Error("Appointment created, but ID missing in response.");
      }

      setModalState({ 
        isOpen: true, 
        type: "success", 
        message: response?.data?.message || response?.message || "Appointment booked successfully!" 
      });

    } catch (error) {
      console.error("Booking Error:", error);
      setModalState({ 
        isOpen: true, 
        type: "error", 
        message: error?.response?.data?.message || error.message || "Appointment booking failed." 
      });
    }
  };

  // UPDATED COMPACT STYLES
  const inputClass = "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none text-sm text-gray-700 placeholder-gray-400";
  const labelClass = "block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider";

  return (
    <div className="w-full bg-gradient-to-br from-blue-50/50 to-blue-100/50 min-h-screen flex flex-col font-sans relative">
      <NavbarLink />

      {/* --- CUSTOM INTERACTIVE MODAL --- */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-900/40 backdrop-blur-sm p-4 transition-opacity duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-[scaleIn_0.2s_ease-out]">
            
            {/* Modal Dynamic Icons */}
            {modalState.type === "loading" && (
              <svg className="animate-spin h-14 w-14 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {modalState.type === "success" && (
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
            )}
            {modalState.type === "error" && (
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
            )}
            {modalState.type === "confirm" && (
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
            )}

            {/* Modal Text */}
            <h3 className="text-xl font-extrabold text-gray-800">
              {modalState.type === "loading" ? "Processing..." : modalState.type === "success" ? "Booking Confirmed!" : modalState.type === "error" ? "Action Failed" : "Confirm Appointment"}
            </h3>
            <p className="text-gray-500 text-sm mt-2 font-medium">{modalState.message}</p>

            {/* Modal Buttons */}
            {modalState.type === "confirm" && (
              <div className="flex gap-3 mt-6 w-full">
                <button onClick={() => setModalState({ isOpen: false, type: "none", message: "" })} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={executeBooking} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/30">Confirm</button>
              </div>
            )}
            {(modalState.type === "success" || modalState.type === "error") && (
              <button onClick={() => setModalState({ isOpen: false, type: "none", message: "" })} className={`mt-6 w-full py-3 rounded-xl text-white font-bold transition-colors shadow-lg ${modalState.type === "success" ? "bg-green-500 hover:bg-green-600 hover:shadow-green-500/30" : "bg-red-500 hover:bg-red-600 hover:shadow-red-500/30"}`}>
                {modalState.type === "success" ? "Done" : "Close"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- MAIN PAGE CONTENT --- */}
      {/* pt-36 ensures content clears the fixed Navbar completely, while pb-12 keeps the bottom tidy */}
      <div className="flex-grow pt-36 lg:pt-40 pb-12 px-4 sm:px-6 flex items-start justify-center min-h-[90vh]">
        {/* WIDER CONTAINER: max-w-[1200px] instead of 1050px. mt-4 to pull it safely down a bit more */}
        <div className="bg-white rounded-3xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] max-w-[1200px] w-full overflow-hidden flex flex-col lg:flex-row border border-gray-100 mt-4">
          
          {/* Left Form Section - Adjusted to 60% width to give fields more horizontal room */}
          <div className="w-full lg:w-[60%] p-6 sm:p-8 flex flex-col justify-center">
            <div className="mb-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Book <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Appointment</span>
              </h2>
              <p className="text-gray-500 text-sm font-medium mt-1">Please fill in the details below to schedule your visit.</p>
            </div>

            <form onSubmit={handleInitialSubmit} className="space-y-5">
              
              {/* SECTION 1: Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-1.5">
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">STEP 1</span>
                  <h3 className="text-sm font-bold text-gray-800">Visit Details</h3>
                </div>
                
                {/* Tighter gaps: gap-x-4 gap-y-3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                  <div className="flex flex-col md:col-span-2">
                    <label htmlFor="hospitalId" className={labelClass}>Select Hospital</label>
                    <select id="hospitalId" name="hospitalId" value={formData.hospitalId} onChange={handleChange} className={inputClass} required>
                      <option value="">Select a hospital...</option>
                      {hospitals.map((h) => <option key={h._id} value={h._id}>{h.username}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="appointmentDate" className={labelClass}>Date</label>
                    <select id="appointmentDate" name="appointmentDate" value={formData.appointmentDate} onChange={handleChange} className={inputClass} required>
                      {getAvailableDates().map((d) => <option key={d.iso} value={d.iso}>{d.label}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="preferredSlot" className={labelClass}>Time Slot</label>
                    <select id="preferredSlot" name="preferredSlot" value={formData.preferredSlot} onChange={handleChange} className={inputClass} required disabled={!formData.hospitalId}>
                      <option value="">{formData.hospitalId ? "Select slot" : "Select hospital"}</option>
                      {timeSlots.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col md:col-span-2">
                    <label htmlFor="selectedDoctor" className={labelClass}>Choose Doctor <span className="text-gray-400 font-normal lowercase">(Optional)</span></label>
                    <select id="selectedDoctor" name="selectedDoctor" value={formData.selectedDoctor || ""} onChange={handleChange} className={inputClass} disabled={!formData.hospitalId}>
                      <option value="">{doctors.length > 0 ? "Any available doctor" : "No doctors available"}</option>
                      {doctors.map((d) => <option key={d._id} value={d._id}>{d.fullName}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Patient Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-1.5">
                  <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">STEP 2</span>
                  <h3 className="text-sm font-bold text-gray-800">Patient Info</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                  {Object.keys(formData).map((key) => {
                    if (["hospitalId", "hospitalName", "preferredSlot", "selectedDoctor", "appointmentDate"].includes(key)) return null;

                    const isTextArea = key === 'address' || key === 'diagnosis';
                    const isSelect = key === 'gender';
                    const formattedLabel = key.replace(/([A-Z])/g, " $1").trim();

                    let spanClass = "col-span-1";
                    if (key === "fullName" || key === "email") spanClass = "col-span-1 md:col-span-2";

                    return (
                      <div key={key} className={`flex flex-col ${spanClass}`}>
                        <label htmlFor={key} className={labelClass}>
                          {formattedLabel} {key === "diagnosis" && <span className="text-gray-400 font-normal lowercase">(Optional)</span>}
                        </label>
                        
                        {isSelect ? (
                          <select id={key} name={key} value={formData[key]} onChange={handleChange} className={inputClass} required>
                            <option value="">Select Gender...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        ) : isTextArea ? (
                          <textarea
                            id={key} name={key} value={formData[key]} onChange={handleChange}
                            placeholder={`Enter ${formattedLabel.toLowerCase()}`}
                            className={`${inputClass} resize-none h-[46px]`} // Shorter text area
                            required={key !== "diagnosis"}
                          />
                        ) : (
                          <input
                            type={key === "email" ? "email" : key === "age" ? "number" : "text"}
                            id={key} name={key} value={formData[key]} onChange={handleChange}
                            placeholder={`Enter ${formattedLabel.toLowerCase()}`}
                            className={inputClass}
                            required
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group text-sm"
                >
                  Book Appointment
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

            </form>
          </div>

          {/* Right Side - Interactive Animated Showcase - 40% Width */}
          <div className="hidden lg:flex w-[40%] bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-900 flex-col items-center justify-center p-8 text-white relative overflow-hidden group">
             {/* Background glows */}
             <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-400 opacity-20 blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:opacity-40 transition-opacity duration-700"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-indigo-400 opacity-20 blur-[80px] translate-y-1/3 -translate-x-1/4 group-hover:opacity-40 transition-opacity duration-700"></div>

             {/* Interactive Floating Badges */}
             <div className="absolute top-8 left-6 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-xl animate-[bounce_4s_infinite_ease-in-out]">
                <span className="text-lg">🏥</span>
                <span className="text-[10px] font-bold tracking-wider">TOP CLINICS</span>
             </div>
             <div className="absolute bottom-12 right-6 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-xl animate-[bounce_5s_infinite_ease-in-out_reverse]">
                <span className="text-green-400 font-bold text-base">✓</span>
                <span className="text-[10px] font-bold tracking-wider">INSTANT BOOK</span>
             </div>

             {/* Lottie Container with continuous gentle float effect */}
            <div className="relative z-10 w-[240px] h-[240px] bg-white/5 p-4 rounded-[2rem] backdrop-blur-sm border border-white/10 shadow-2xl animate-[bounce_6s_infinite_ease-in-out]">
              <div ref={container} className="w-full h-full drop-shadow-2xl"></div>
            </div>
            
            <div className="mt-10 text-center relative z-10">
              <h3 className="text-xl font-bold tracking-tight mb-2 text-white drop-shadow-md">Health, Simplified.</h3>
              <p className="text-blue-100/90 text-xs leading-relaxed max-w-[220px] mx-auto font-medium">
                Skip the waiting line and secure your medical consultation in seconds.
              </p>
            </div>
          </div>

        </div>
      </div>
      
      <Footer />
      
      {/* Required Inline Keyframes for custom modal popping animation */}
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default OpdForm;