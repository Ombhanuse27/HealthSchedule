import { useEffect, useState, useRef } from "react";
import { getHospitals } from "../api/adminApi";
import { getDoctorsData } from "../api/doctorApi";
import { submitOpdForm, checkDuplicate } from "../api/opdApi";
import React from "react";
import lottie from "lottie-web";
import Footer from "./Footer/Footer";

// --- Helper Functions (Logic Untouched) ---
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
  return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
};

const generateTimeSlots = (startTimeStr, endTimeStr) => {
  const startMinutes = parseTime(startTimeStr);
  const endMinutes = parseTime(endTimeStr);
  const slotDuration = 3 * 60;
  const slots = [];
  for (let cur = startMinutes; cur < endMinutes; cur += slotDuration) {
    const slotEnd = Math.min(cur + slotDuration, endMinutes);
    if (slotEnd > cur) slots.push(`${formatTime(cur)} - ${formatTime(slotEnd)}`);
  }
  return slots;
};

// --- Component ---
const OpdForm = () => {
  const container = useRef(null);
  const [doctors, setDoctors] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, type: "none", message: "" });
  const [hospitals, setHospitals] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  const [formData, setFormData] = useState({
    fullName: "", age: "", gender: "", contactNumber: "", email: "",
    address: "", diagnosis: "", hospitalId: "", hospitalName: "",
    selectedDoctor: "", preferredSlot: "",
    appointmentDate: getLocalISODate(new Date()),
  });

  useEffect(() => {
    const animationInstance = lottie.loadAnimation({
      container: container.current,
      renderer: "svg", loop: true, autoplay: true,
      animationData: require("../animations/appointment.json"),
    });
    return () => animationInstance.destroy();
  }, []);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await getHospitals();
        if (Array.isArray(data)) setHospitals(data);
        else setModalState({ isOpen: true, type: "error", message: "Error fetching hospital list." });
      } catch {
        setModalState({ isOpen: true, type: "error", message: "Error fetching hospital list." });
      }
    };
    fetchHospitals();
  }, []);

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i <= (6 - today.getDay()); i++) {
      const next = new Date();
      next.setDate(today.getDate() + i);
      dates.push({
        iso: getLocalISODate(next),
        label: i === 0 ? "Today" : next.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    return dates;
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    if (name === "hospitalId") {
      const sel = hospitals.find((h) => h._id === value);
      if (sel) {
        setTimeSlots(generateTimeSlots(sel.hospitalStartTime, sel.hospitalEndTime));
        try {
          const allDoctors = await getDoctorsData();
          setDoctors(allDoctors.filter((d) => d.hospitalId === sel._id));
        } catch { setDoctors([]); }
        setFormData((prev) => ({ ...prev, hospitalId: value, hospitalName: sel.username, preferredSlot: "", selectedDoctor: "" }));
      } else {
        setTimeSlots([]); setDoctors([]);
        setFormData((prev) => ({ ...prev, hospitalId: "", hospitalName: "", preferredSlot: "", selectedDoctor: "" }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const checkIfDuplicateExists = async () => {
    try {
      const res = await checkDuplicate(formData.fullName.trim(), formData.hospitalId);
      return res?.data?.exists || res?.exists || false;
    } catch { return false; }
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setModalState({ isOpen: true, type: "confirm", message: "Are you sure you want to book this appointment?" });
  };

  const executeBooking = async () => {
    setModalState({ isOpen: true, type: "loading", message: "Processing your appointment..." });
    const isDuplicate = await checkIfDuplicateExists();
    if (isDuplicate) { setModalState({ isOpen: true, type: "error", message: "This Full Name already exists. Please use a different name." }); return; }
    const selectedHospital = hospitals.find((h) => h._id === formData.hospitalId);
    if (!selectedHospital) { setModalState({ isOpen: true, type: "error", message: "Invalid hospital selected." }); return; }
    try {
      const response = await submitOpdForm(formData.hospitalId, formData);
      const appointmentData = response?.data?.appointment || response?.appointment;
      if (!appointmentData?._id) throw new Error("Appointment created, but ID missing in response.");
      setModalState({ isOpen: true, type: "success", message: response?.data?.message || response?.message || "Appointment booked successfully!" });
    } catch (error) {
      setModalState({ isOpen: true, type: "error", message: error?.response?.data?.message || error.message || "Appointment booking failed." });
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-300 outline-none transition-all";
  const inputStyle = { background: "#F8FAFF", border: "1.5px solid #E0E7FF" };
  const inputFocusHandlers = {
    onFocus: (e) => { e.target.style.borderColor = "#6366F1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; e.target.style.background = "#fff"; },
    onBlur:  (e) => { e.target.style.borderColor = "#E0E7FF"; e.target.style.boxShadow = "none"; e.target.style.background = "#F8FAFF"; },
  };
  const labelCls = "block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5";

  return (
    // ── NO <NavbarLink /> — already in App.js globally
    // ── NO pt-36/pt-40 — App.js handles the 88px navbar offset via pt-[88px]
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", background: "linear-gradient(135deg,#F0F4FF 0%,#EFF6FF 50%,#F0FDF4 100%)" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes scaleIn { from{opacity:0;transform:scale(0.93) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .modal-in { animation: scaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1); }
        .form-in  { animation: fadeUp 0.4s ease both; }
        select { appearance: none; }
      `}</style>

      {/* ── Modal ── */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}>
          <div className="modal-in bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center" style={{ boxShadow: "0 32px 80px rgba(99,102,241,0.2)" }}>
            {modalState.type === "loading" && (
              <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin mb-4" />
            )}
            {modalState.type === "success" && (
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#ECFDF5" }}>
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
            )}
            {modalState.type === "error" && (
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#FEF2F2" }}>
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
            )}
            {modalState.type === "confirm" && (
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#EEF2FF" }}>
                <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            )}
            <h3 className="text-xl font-extrabold text-slate-800">
              {modalState.type === "loading" ? "Processing…" : modalState.type === "success" ? "Booking Confirmed!" : modalState.type === "error" ? "Something went wrong" : "Confirm Appointment"}
            </h3>
            <p className="text-slate-400 text-sm mt-2 font-medium">{modalState.message}</p>
            {modalState.type === "confirm" && (
              <div className="flex gap-3 mt-6 w-full">
                <button onClick={() => setModalState({ isOpen: false, type: "none", message: "" })} className="flex-1 py-3 rounded-xl font-bold text-slate-500 transition-all hover:bg-slate-50" style={{ border: "1.5px solid #E2E8F0" }}>
                  Cancel
                </button>
                <button onClick={executeBooking} className="flex-1 py-3 rounded-xl font-extrabold text-white transition-all" style={{ background: "linear-gradient(135deg,#6366F1,#818CF8)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                  Confirm
                </button>
              </div>
            )}
            {(modalState.type === "success" || modalState.type === "error") && (
              <button
                onClick={() => setModalState({ isOpen: false, type: "none", message: "" })}
                className="mt-6 w-full py-3 rounded-xl font-extrabold text-white transition-all"
                style={{ background: modalState.type === "success" ? "linear-gradient(135deg,#10B981,#34D399)" : "linear-gradient(135deg,#EF4444,#F97316)" }}
              >
                {modalState.type === "success" ? "Done" : "Close"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex-grow flex items-start justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="form-in w-full max-w-6xl bg-white rounded-3xl overflow-hidden flex flex-col lg:flex-row" style={{ boxShadow: "0 20px 60px rgba(99,102,241,0.1)", border: "1px solid #E0E7FF" }}>

          {/* ── Left: Form ── */}
          <div className="w-full lg:w-[58%] p-6 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3" style={{ background: "#EEF2FF", border: "1px solid #C7D2FE" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">OPD Booking</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
                Book an{" "}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg,#4F46E5,#0EA5E9)" }}>
                  Appointment
                </span>
              </h2>
              <p className="text-slate-400 text-sm font-medium mt-1.5">Fill in the details below to schedule your visit.</p>
            </div>

            <form onSubmit={handleInitialSubmit} className="space-y-6">

              {/* Step 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2" style={{ borderBottom: "1.5px solid #F1F5F9" }}>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full" style={{ background: "#EEF2FF", color: "#6366F1" }}>STEP 1</span>
                  <h3 className="text-sm font-bold text-slate-700">Visit Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hospital */}
                  <div className="md:col-span-2">
                    <label className={labelCls}>Select Hospital</label>
                    <select name="hospitalId" value={formData.hospitalId} onChange={handleChange} className={inputCls} style={inputStyle} {...inputFocusHandlers} required>
                      <option value="">Select a hospital…</option>
                      {hospitals.map((h) => <option key={h._id} value={h._id}>{h.username}</option>)}
                    </select>
                  </div>
                  {/* Date */}
                  <div>
                    <label className={labelCls}>Date</label>
                    <select name="appointmentDate" value={formData.appointmentDate} onChange={handleChange} className={inputCls} style={inputStyle} {...inputFocusHandlers} required>
                      {getAvailableDates().map((d) => <option key={d.iso} value={d.iso}>{d.label}</option>)}
                    </select>
                  </div>
                  {/* Time Slot */}
                  <div>
                    <label className={labelCls}>Time Slot</label>
                    <select name="preferredSlot" value={formData.preferredSlot} onChange={handleChange} className={inputCls} style={{ ...inputStyle, opacity: formData.hospitalId ? 1 : 0.6 }} {...inputFocusHandlers} required disabled={!formData.hospitalId}>
                      <option value="">{formData.hospitalId ? "Select slot" : "Select hospital first"}</option>
                      {timeSlots.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {/* Doctor */}
                  <div className="md:col-span-2">
                    <label className={labelCls}>
                      Choose Doctor <span className="text-slate-300 font-normal normal-case">(optional)</span>
                    </label>
                    <select name="selectedDoctor" value={formData.selectedDoctor || ""} onChange={handleChange} className={inputCls} style={{ ...inputStyle, opacity: formData.hospitalId ? 1 : 0.6 }} {...inputFocusHandlers} disabled={!formData.hospitalId}>
                      <option value="">{doctors.length > 0 ? "Any available doctor" : "No doctors available"}</option>
                      {doctors.map((d) => <option key={d._id} value={d._id}>{d.fullName}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2" style={{ borderBottom: "1.5px solid #F1F5F9" }}>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full" style={{ background: "#F1F5F9", color: "#64748B" }}>STEP 2</span>
                  <h3 className="text-sm font-bold text-slate-700">Patient Info</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(formData).map((key) => {
                    if (["hospitalId", "hospitalName", "preferredSlot", "selectedDoctor", "appointmentDate"].includes(key)) return null;
                    const isTextArea = key === "address" || key === "diagnosis";
                    const isSelect = key === "gender";
                    const label = key.replace(/([A-Z])/g, " $1").trim();
                    const spanFull = key === "fullName" || key === "email" || isTextArea;

                    return (
                      <div key={key} className={spanFull ? "md:col-span-2" : ""}>
                        <label className={labelCls}>
                          {label} {key === "diagnosis" && <span className="text-slate-300 font-normal normal-case">(optional)</span>}
                        </label>
                        {isSelect ? (
                          <select name={key} value={formData[key]} onChange={handleChange} className={inputCls} style={inputStyle} {...inputFocusHandlers} required>
                            <option value="">Select gender…</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        ) : isTextArea ? (
                          <textarea name={key} value={formData[key]} onChange={handleChange} placeholder={`Enter ${label.toLowerCase()}`} rows={2} className={`${inputCls} resize-none`} style={inputStyle} {...inputFocusHandlers} required={key !== "diagnosis"} />
                        ) : (
                          <input type={key === "email" ? "email" : key === "age" ? "number" : "text"} name={key} value={formData[key]} onChange={handleChange} placeholder={`Enter ${label.toLowerCase()}`} className={inputCls} style={inputStyle} {...inputFocusHandlers} required />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-95 group"
                style={{ background: "linear-gradient(135deg,#6366F1 0%,#0EA5E9 100%)", boxShadow: "0 4px 18px rgba(99,102,241,0.3)" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                Book Appointment
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </form>
          </div>

          {/* ── Right: Illustration ── */}
          <div
            className="hidden lg:flex w-[42%] flex-col items-center justify-center p-10 text-white relative overflow-hidden"
            style={{ background: "linear-gradient(145deg,#4F46E5 0%,#6366F1 40%,#0EA5E9 100%)" }}
          >
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 blur-[80px]" style={{ background: "#818CF8", transform: "translate(30%,-30%)" }} />
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-20 blur-[80px]" style={{ background: "#38BDF8", transform: "translate(-30%,30%)" }} />

            {/* Floating badges */}
            <div className="absolute top-8 left-6 flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-md" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <span className="text-base">🏥</span>
              <span className="text-xs font-bold tracking-widest">TOP CLINICS</span>
            </div>
            <div className="absolute bottom-10 right-6 flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-md" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <span className="text-green-300 font-bold">✓</span>
              <span className="text-xs font-bold tracking-widest">INSTANT BOOK</span>
            </div>

            {/* Lottie animation */}
            <div className="relative z-10 w-56 h-56 p-4 rounded-3xl backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
              <div ref={container} className="w-full h-full" />
            </div>

            <div className="mt-8 text-center relative z-10">
              <h3 className="text-xl font-extrabold tracking-tight mb-2 drop-shadow-md">Health, Simplified.</h3>
              <p className="text-blue-100/80 text-xs leading-relaxed max-w-[200px] mx-auto font-medium">
                Skip the waiting line and secure your medical consultation in seconds.
              </p>
            </div>

            {/* Stats row */}
            <div className="mt-8 flex gap-6 relative z-10">
              {[["500+", "Hospitals"], ["10k+", "Patients"], ["99%", "Satisfaction"]].map(([val, lbl]) => (
                <div key={lbl} className="text-center">
                  <p className="text-lg font-extrabold">{val}</p>
                  <p className="text-blue-200 text-xs font-semibold">{lbl}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OpdForm;