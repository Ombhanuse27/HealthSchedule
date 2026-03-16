import React, { useState, useEffect } from "react";
import {
  Trash2,
  Search,
  Calendar,
  User,
  Clock,
  Stethoscope,
  UserCheck,
  AlertCircle,
  Filter,
  ChevronDown,
  Activity,
  Heart,
  TrendingUp,
  Bell,
  RefreshCw,
  X,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

// ✅ Import API functions
import { getOpdRecords } from "../../api/opdApi";
import { getDoctorsData } from "../../api/doctorApi";
import { assignDoctors } from "../../api/adminApi";
import { getLoggedInHospital } from "../../api/adminApi";
import { deleteOpdRecord, delayAppointments } from "../../api/opdApi";
import { rescheduleOpdAppointment } from "../../api/opdApi";

// --- Helper Functions ---
const getTodayDate = () => new Date().toLocaleDateString("en-CA");

const parseTime = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const [time, period] = timeStr.split(" ");
  if (!time || !period) return 0;
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
  return `${hour}:${minute.toString().padStart(2, "0")} ${period}`;
};

const generateTimeSlots = (startTimeStr, endTimeStr) => {
  if (!startTimeStr || !endTimeStr) return [];
  const startMinutes = parseTime(startTimeStr);
  const endMinutes = parseTime(endTimeStr);
  const slotDuration = 3 * 60;
  const slots = [];
  for (let cur = startMinutes; cur < endMinutes; cur += slotDuration) {
    const end = Math.min(cur + slotDuration, endMinutes);
    if (end > cur) slots.push(`${formatTime(cur)} - ${formatTime(end)}`);
  }
  return slots;
};

// Stat Card for the summary row
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div
    className="flex items-center gap-4 rounded-2xl px-5 py-4 shadow-sm border"
    style={{ background: bg, borderColor: `${color}22` }}
  >
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center shadow-inner"
      style={{ background: `${color}18` }}
    >
      <Icon size={22} style={{ color }} />
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>
        {label}
      </p>
      <p className="text-2xl font-extrabold text-slate-800 leading-none mt-0.5">{value}</p>
    </div>
  </div>
);

// --- Main Component ---
const AdminDashboard = ({ children }) => {
  const [opdRecords, setOpdRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [rescheduleRecord, setRescheduleRecord] = useState(null);
  const [newSlot, setNewSlot] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [delaySuccess, setDelaySuccess] = useState(null);

  const token = localStorage.getItem("token");
  const todayStr = getTodayDate();

  const getNextAvailableSlots = (currentSlot) => {
    const index = timeSlots.findIndex((slot) => slot === currentSlot);
    if (index === -1) return [];
    return timeSlots.slice(index + 1);
  };

  const getAvailableRescheduleDates = () => {
    const dates = [];
    const today = new Date();
    const daysUntilSaturday = 6 - today.getDay();
    for (let i = 0; i <= daysUntilSaturday; i++) {
      const next = new Date();
      next.setDate(today.getDate() + i);
      const isoDate = next.toLocaleDateString("en-CA");
      const label =
        i === 0
          ? "Today"
          : next.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
      dates.push({ isoDate, label });
    }
    return dates;
  };

  const handleReschedule = async () => {
    if (!newSlot || !rescheduleRecord || !rescheduleDate) {
      alert("Please select both date and time slot.");
      return;
    }
    try {
      setRescheduling(true);
      const response = await rescheduleOpdAppointment(
        rescheduleRecord._id,
        { newSlot, newDate: rescheduleDate },
        token
      );
      const updatedAppt = response?.appointment || response?.data?.appointment;
      if (updatedAppt) {
        setOpdRecords((prev) =>
          prev.map((r) =>
            r && r._id === rescheduleRecord._id
              ? { ...r, appointmentDate: updatedAppt.appointmentDate, preferredSlot: updatedAppt.preferredSlot, appointmentTime: updatedAppt.appointmentTime }
              : r
          )
        );
        alert(response?.message || "Appointment rescheduled successfully!");
        setRescheduleRecord(null);
        setNewSlot("");
        setRescheduleDate("");
      } else {
        throw new Error("Backend did not return updated appointment data.");
      }
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Failed to reschedule appointment");
    } finally {
      setRescheduling(false);
    }
  };

  const filteredRecords = opdRecords.filter((record) => {
    if (!record) return false;
    const matchesDoctor = selectedDoctorId
      ? record.assignedDoctor &&
        (record.assignedDoctor._id === selectedDoctorId || record.assignedDoctor === selectedDoctorId)
      : true;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (record.fullName?.toLowerCase() || "").includes(query) ||
      (record.diagnosis?.toLowerCase() || "").includes(query) ||
      (record.contactNumber || "").includes(query);
    return matchesDoctor && matchesSearch;
  });

  const uniqueDates = [...new Set(filteredRecords.map((r) => r?.appointmentDate).filter(Boolean))];
  uniqueDates.sort((a, b) => b.localeCompare(a));
  const datesToShow = selectedDate ? [selectedDate] : uniqueDates;

  const getRecordsForDateAndSlot = (date, slot) => {
    const [startStr, endStr] = slot.split(" - ");
    const slotStart = parseTime(startStr);
    const slotEnd = parseTime(endStr);
    return filteredRecords
      .filter((r) => {
        if (!r || r.appointmentDate !== date) return false;
        const t = parseTime(r.appointmentTime);
        return t >= slotStart && t < slotEnd;
      })
      .sort((a, b) => parseTime(a.appointmentTime) - parseTime(b.appointmentTime));
  };

  const applyDelay = async (minutes) => {
    if (!window.confirm(`Delay all upcoming appointments by ${minutes} minutes?`)) return;
    try {
      const res = await delayAppointments(minutes, token);
      setDelaySuccess(`+${minutes} min delay applied!`);
      setTimeout(() => setDelaySuccess(null), 3000);
      const updated = await getOpdRecords(token);
      const populated = updated.data.map((record) => {
        if (record.assignedDoctor) {
          const doctor = doctors.find((d) => d._id === record.assignedDoctor);
          if (doctor) return { ...record, assignedDoctor: doctor };
        }
        return record;
      });
      setOpdRecords(populated);
    } catch {
      alert("Failed to apply delay");
    }
  };

  const assignDoctorsHandler = async (record) => {
    if (!record.assignedDoctorId) { alert("Please select a doctor before sending."); return; }
    if (!window.confirm(`Assign ${record.fullName}'s appointment to the selected doctor?`)) return;
    try {
      await assignDoctors(record._id, record.assignedDoctorId, token);
      alert("Appointment successfully assigned!");
      const doc = doctors.find((d) => d._id === record.assignedDoctorId);
      setOpdRecords((prev) =>
        prev.map((r) => (r._id === record._id ? { ...r, assignedDoctor: doc } : r))
      );
    } catch { alert("Failed to assign appointment."); }
  };

  const doctorFilteredRecords = selectedDoctorId
    ? opdRecords.filter(
        (r) =>
          r.assignedDoctor &&
          (r.assignedDoctor._id === selectedDoctorId || r.assignedDoctor === selectedDoctorId)
      )
    : opdRecords;

  const getUncategorizedRecordsForDate = (date) => {
    if (timeSlots.length === 0)
      return doctorFilteredRecords.filter((r) => r.appointmentDate === date);
    const allRanges = timeSlots.map((slot) => {
      const [s, e] = slot.split(" - ");
      return { start: parseTime(s), end: parseTime(e) };
    });
    return doctorFilteredRecords
      .filter((r) => {
        if (r.appointmentDate !== date) return false;
        const t = parseTime(r.appointmentTime);
        return !allRanges.some((range) => t >= range.start && t < range.end);
      })
      .sort((a, b) => parseTime(a.appointmentTime) - parseTime(b.appointmentTime));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: hospitalData } = await getLoggedInHospital(token);
        if (!hospitalData?.username) throw new Error("Could not determine logged-in hospital.");
        if (hospitalData.hospitalStartTime && hospitalData.hospitalEndTime) {
          setTimeSlots(generateTimeSlots(hospitalData.hospitalStartTime, hospitalData.hospitalEndTime));
        }
        const [opdResponse, allDoctors] = await Promise.all([getOpdRecords(token), getDoctorsData(token)]);
        const filtered = allDoctors.filter((d) => d.hospital === hospitalData.username);
        setDoctors(filtered);
        const populated = opdResponse.data.map((r) => {
          if (r.assignedDoctor) {
            const d = allDoctors.find((doc) => doc._id === r.assignedDoctor);
            if (d) return { ...r, assignedDoctor: d };
          }
          return r;
        });
        setOpdRecords(Array.isArray(populated) ? populated : []);
      } catch (err) {
        alert("Error fetching dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const todayRecords = opdRecords.filter((r) => r?.appointmentDate === todayStr);
  const assignedCount = todayRecords.filter((r) => r?.assignedDoctor?.fullName).length;
  const pendingCount = todayRecords.length - assignedCount;

  return (
    <div
      className="flex flex-1 min-h-screen"
      style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", background: "#F0F4FF" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .pulse-dot { animation: pulseDot 1.5s infinite; }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        .card-hover { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 20px 40px rgba(99,102,241,0.12); }
        .slot-card { animation: slideUp 0.4s ease both; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .row-hover { transition: background 0.18s; }
        .row-hover:hover { background: linear-gradient(90deg, #EEF2FF 0%, #F0FDF4 100%); }
        .badge-pill { 
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700;
        }
        .delay-toast {
          animation: toastIn 0.3s ease;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-overlay { animation: fadeIn 0.2s ease; }
        .modal-card { animation: scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .custom-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }
        .loader-ring { border: 3px solid #e0e7ff; border-top-color: #6366f1; animation: spin 0.8s linear infinite; border-radius: 9999px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="flex-1 overflow-y-auto px-4 md:px-10 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="loader-ring w-14 h-14" />
            <div className="text-center">
              <p className="text-indigo-600 font-bold text-lg">Loading Dashboard</p>
              <p className="text-slate-400 text-sm mt-1">Fetching hospital records...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto pb-24 space-y-8">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">System Live</span>
                </div>
                <h1
                  className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none"
                  style={{ background: "linear-gradient(135deg, #4F46E5 0%, #0EA5E9 60%, #10B981 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                  OPD Dashboard
                </h1>
                <p className="text-slate-400 font-medium mt-1 text-sm">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-200 transition-all">
                  <Bell size={18} />
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-200 transition-all"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Activity} label="Today's Patients" value={todayRecords.length} color="#6366F1" bg="#FAFAFE" />
              <StatCard icon={CheckCircle2} label="Assigned" value={assignedCount} color="#10B981" bg="#F0FDF9" />
              <StatCard icon={AlertCircle} label="Pending" value={pendingCount} color="#F59E0B" bg="#FFFBEB" />
              <StatCard icon={Stethoscope} label="Doctors On Duty" value={doctors.length} color="#0EA5E9" bg="#F0F9FF" />
            </div>

            {/* ── Delay Banner ── */}
            {selectedDate === todayStr && filteredRecords.some((r) => r.appointmentDate === todayStr) && (
              <div
                className="relative overflow-hidden rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                style={{ background: "linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 100%)", border: "1px solid #FED7AA" }}
              >
                <div
                  className="absolute inset-0 opacity-5"
                  style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #F59E0B 0%, transparent 60%)" }}
                />
                <div className="flex items-center gap-3 relative">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Clock size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-800">Running Behind Schedule?</p>
                    <p className="text-xs text-amber-600 mt-0.5">Push all upcoming today's appointments forward</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 relative">
                  {delaySuccess && (
                    <span className="delay-toast text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <CheckCircle2 size={13} /> {delaySuccess}
                    </span>
                  )}
                  <button
                    onClick={() => applyDelay(5)}
                    className="px-4 py-2 rounded-xl font-bold text-sm text-white shadow-md transition-all active:scale-95 hover:shadow-lg"
                    style={{ background: "linear-gradient(135deg, #F59E0B, #FBBF24)" }}
                  >
                    +5 Min
                  </button>
                  <button
                    onClick={() => applyDelay(10)}
                    className="px-4 py-2 rounded-xl font-bold text-sm text-white shadow-md transition-all active:scale-95 hover:shadow-lg"
                    style={{ background: "linear-gradient(135deg, #EF4444, #F97316)" }}
                  >
                    +10 Min
                  </button>
                </div>
              </div>
            )}

            {/* ── Control Bar ── */}
            <div
              className="sticky top-0 z-30 rounded-2xl px-5 py-4 flex flex-col md:flex-row gap-4 items-center"
              style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", border: "1px solid rgba(99,102,241,0.12)", boxShadow: "0 4px 24px rgba(99,102,241,0.08)" }}
            >
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={17} />
                <input
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-300 outline-none transition-all"
                  style={{ background: "#F8FAFF", border: "1.5px solid #E0E7FF" }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                  onBlur={(e) => (e.target.style.borderColor = "#E0E7FF")}
                  placeholder="Search patient, diagnosis, phone…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Doctor Filter */}
              <div className="relative w-full md:w-52">
                <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300" size={15} />
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="custom-select w-full pl-10 py-2.5 rounded-xl text-sm font-semibold text-slate-700 outline-none cursor-pointer"
                  style={{ background: "#F8FAFF", border: "1.5px solid #E0E7FF" }}
                >
                  <option value="">All Doctors</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>{doc.fullName}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="relative w-full md:w-52">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300" size={15} />
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="custom-select w-full pl-10 py-2.5 rounded-xl text-sm font-semibold text-slate-700 outline-none cursor-pointer"
                  style={{ background: "#F8FAFF", border: "1.5px solid #E0E7FF" }}
                >
                  <option value="">All Dates</option>
                  <option value={todayStr}>Today ({todayStr})</option>
                  {uniqueDates
                    .filter((d) => d !== todayStr)
                    .map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* ── Appointment Lists ── */}
            {datesToShow.length > 0 ? (
              datesToShow.map((date) => (
                <div key={date} className="space-y-6">
                  {/* Date Header */}
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm"
                      style={{
                        background: date === todayStr ? "linear-gradient(135deg,#EEF2FF,#E0F2FE)" : "#F8FAFF",
                        color: date === todayStr ? "#4F46E5" : "#64748B",
                        border: `1.5px solid ${date === todayStr ? "#C7D2FE" : "#E2E8F0"}`,
                      }}
                    >
                      <Calendar size={15} />
                      {date === todayStr ? `Today — ${date}` : date}
                    </div>
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-xs text-slate-400 font-medium">
                      {filteredRecords.filter((r) => r.appointmentDate === date).length} appointments
                    </span>
                  </div>

                  {/* Slot Cards */}
                  {timeSlots.map((slot, idx) => {
                    const records = getRecordsForDateAndSlot(date, slot);
                    if (records.length === 0) return null;
                    return (
                      <div
                        key={idx}
                        className="slot-card rounded-2xl overflow-hidden card-hover"
                        style={{
                          background: "#fff",
                          border: "1px solid #E0E7FF",
                          boxShadow: "0 2px 12px rgba(99,102,241,0.07)",
                          animationDelay: `${idx * 80}ms`,
                        }}
                      >
                        <div
                          className="px-6 py-4 flex items-center justify-between"
                          style={{ background: "linear-gradient(90deg,#F5F3FF 0%,#EFF6FF 100%)", borderBottom: "1px solid #E0E7FF" }}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                              <Clock size={16} className="text-indigo-500" />
                            </div>
                            <span className="font-bold text-slate-700 text-base">{slot}</span>
                          </div>
                          <span
                            className="badge-pill"
                            style={{ background: "#EEF2FF", color: "#4F46E5" }}
                          >
                            {records.length} patient{records.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <AppointmentTable
                          records={records}
                          doctors={doctors}
                          assignDoctorsHandler={assignDoctorsHandler}
                          setOpdRecords={setOpdRecords}
                          setRescheduleRecord={setRescheduleRecord}
                          setNewSlot={setNewSlot}
                          token={token}
                        />
                      </div>
                    );
                  })}

                  {/* Uncategorized */}
                  {getUncategorizedRecordsForDate(date).length > 0 && (
                    <div
                      className="slot-card rounded-2xl overflow-hidden"
                      style={{ background: "#fff", border: "1.5px solid #FED7AA", boxShadow: "0 2px 12px rgba(245,158,11,0.08)" }}
                    >
                      <div
                        className="px-6 py-4 flex items-center gap-2.5"
                        style={{ background: "linear-gradient(90deg,#FFFBEB,#FFF7ED)", borderBottom: "1.5px solid #FED7AA" }}
                      >
                        <AlertCircle size={18} className="text-amber-500" />
                        <span className="font-bold text-amber-800">Unscheduled / Other Times</span>
                      </div>
                      <AppointmentTable
                        records={getUncategorizedRecordsForDate(date)}
                        doctors={doctors}
                        assignDoctorsHandler={assignDoctorsHandler}
                        setOpdRecords={setOpdRecords}
                        setRescheduleRecord={setRescheduleRecord}
                        setNewSlot={setNewSlot}
                        token={token}
                      />
                    </div>
                  )}

                  {getUncategorizedRecordsForDate(date).length === 0 &&
                    timeSlots.every((s) => getRecordsForDateAndSlot(date, s).length === 0) && (
                      <div
                        className="text-center py-12 rounded-2xl"
                        style={{ background: "#FAFAFE", border: "1.5px dashed #C7D2FE" }}
                      >
                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                          <Calendar size={22} className="text-indigo-300" />
                        </div>
                        <p className="text-slate-400 font-medium text-sm">No appointments match the current filter.</p>
                      </div>
                    )}
                </div>
              ))
            ) : (
              <div
                className="flex flex-col items-center justify-center py-24 rounded-3xl"
                style={{ background: "#FAFAFE", border: "1.5px dashed #C7D2FE" }}
              >
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
                  style={{ background: "linear-gradient(135deg,#EEF2FF,#E0F2FE)" }}
                >
                  <UserCheck size={36} className="text-indigo-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No Records Found</h3>
                <p className="text-slate-400 text-sm max-w-xs text-center">
                  No appointments match your current filters. Try adjusting your search.
                </p>
              </div>
            )}

            {children}

            {/* ── Reschedule Modal ── */}
            {rescheduleRecord && (
              <div
                className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)" }}
              >
                <div
                  className="modal-card w-full max-w-md rounded-3xl p-0 overflow-hidden"
                  style={{ background: "#fff", boxShadow: "0 32px 80px rgba(99,102,241,0.2)" }}
                >
                  {/* Modal Header */}
                  <div
                    className="px-7 pt-7 pb-5 relative"
                    style={{ background: "linear-gradient(135deg,#F5F3FF 0%,#EFF6FF 100%)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                          <Calendar size={20} className="text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-extrabold text-slate-800">Reschedule</h3>
                          <p className="text-xs text-slate-400">{rescheduleRecord.fullName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setRescheduleRecord(null); setRescheduleDate(""); }}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div
                      className="mt-4 px-4 py-3 rounded-xl flex items-center gap-3 text-sm"
                      style={{ background: "rgba(255,255,255,0.7)", border: "1px solid #E0E7FF" }}
                    >
                      <Clock size={14} className="text-indigo-400 shrink-0" />
                      <span className="text-slate-500 font-medium">
                        Current: <strong className="text-slate-700">{rescheduleRecord.appointmentDate}</strong> at{" "}
                        <strong className="text-slate-700">{rescheduleRecord.appointmentTime}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="px-7 py-6 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Select New Date</label>
                      <select
                        className="custom-select w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 outline-none"
                        style={{ background: "#F8FAFF", border: "1.5px solid #E0E7FF" }}
                        value={rescheduleDate}
                        onChange={(e) => { setRescheduleDate(e.target.value); setNewSlot(""); }}
                      >
                        <option value="">Choose a date...</option>
                        {getAvailableRescheduleDates().map((d) => (
                          <option key={d.isoDate} value={d.isoDate}>{d.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Select Time Slot</label>
                      <select
                        className="custom-select w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 outline-none disabled:opacity-50"
                        style={{ background: "#F8FAFF", border: "1.5px solid #E0E7FF" }}
                        value={newSlot}
                        onChange={(e) => setNewSlot(e.target.value)}
                        disabled={!rescheduleDate}
                      >
                        <option value="">{rescheduleDate ? "Choose a slot..." : "Select date first"}</option>
                        {(rescheduleDate !== todayStr
                          ? timeSlots
                          : getNextAvailableSlots(rescheduleRecord.preferredSlot)
                        ).map((s, i) => (
                          <option key={i} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-7 pb-7 flex gap-3">
                    <button
                      onClick={() => { setRescheduleRecord(null); setRescheduleDate(""); }}
                      className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-500 transition-all hover:bg-slate-50"
                      style={{ border: "1.5px solid #E2E8F0" }}
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!newSlot || !rescheduleDate || rescheduling}
                      onClick={handleReschedule}
                      className="flex-1 py-3 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg,#6366F1,#818CF8)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
                    >
                      {rescheduling ? (
                        <><div className="loader-ring w-4 h-4" /> Saving…</>
                      ) : (
                        <><CheckCircle2 size={16} /> Confirm</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Appointment Table ──
const AppointmentTable = ({ records, doctors, assignDoctorsHandler, setOpdRecords, setRescheduleRecord, setNewSlot, token }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr style={{ borderBottom: "1.5px solid #F1F5F9" }}>
          {["Patient", "Diagnosis", "Ref #", "Contact", "Time", "Action"].map((h) => (
            <th
              key={h}
              className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest"
              style={{ color: "#94A3B8" }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <AppointmentRow
            key={record._id}
            record={record}
            doctors={doctors}
            assignDoctorsHandler={assignDoctorsHandler}
            setOpdRecords={setOpdRecords}
            setRescheduleRecord={setRescheduleRecord}
            setNewSlot={setNewSlot}
            token={token}
          />
        ))}
      </tbody>
    </table>
  </div>
);

// Avatar colour palette
const avatarColors = [
  ["#6366F1", "#EEF2FF"], ["#10B981", "#ECFDF5"],
  ["#0EA5E9", "#F0F9FF"], ["#F59E0B", "#FFFBEB"],
  ["#EF4444", "#FEF2F2"], ["#8B5CF6", "#F5F3FF"],
];

const AppointmentRow = ({ record, doctors, assignDoctorsHandler, setOpdRecords, setRescheduleRecord, setNewSlot, token }) => {
  const isAssigned = !!(record.assignedDoctor?.fullName);
  const [fg, bg] = avatarColors[record.fullName.charCodeAt(0) % avatarColors.length];

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${record.fullName}'s appointment?`)) return;
    try {
      await deleteOpdRecord(record._id, token);
      setOpdRecords((prev) => prev.filter((r) => r._id !== record._id));
    } catch {
      alert("Failed to delete appointment.");
    }
  };

  return (
    <tr className="row-hover border-b last:border-0" style={{ borderColor: "#F8FAFC" }}>
      {/* Patient */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0"
            style={{ background: bg, color: fg }}
          >
            {record.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">{record.fullName}</p>
            <p className="text-xs text-slate-400 mt-0.5 capitalize">
              {record.age}y · {record.gender || "—"}
            </p>
          </div>
        </div>
      </td>

      {/* Diagnosis */}
      <td className="px-5 py-4 max-w-[160px]">
        <p className="text-sm text-slate-500 truncate" title={record.diagnosis}>
          {record.diagnosis || "—"}
        </p>
      </td>

      {/* Ref */}
      <td className="px-5 py-4">
        <span
          className="text-xs font-mono font-bold px-2 py-1 rounded-lg"
          style={{ background: "#F1F5F9", color: "#64748B" }}
        >
          #{record.appointmentNumber}
        </span>
      </td>

      {/* Contact */}
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-slate-600">{record.contactNumber || "—"}</p>
      </td>

      {/* Time */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-indigo-400" />
          <span className="text-sm font-bold text-indigo-600">{record.appointmentTime}</span>
        </div>
      </td>

      {/* Action */}
      <td className="px-5 py-4">
        {isAssigned ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="badge-pill"
              style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}
            >
              <UserCheck size={11} /> {record.assignedDoctor.fullName}
            </span>
            <button
              onClick={() => { setRescheduleRecord(record); setNewSlot(""); }}
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
              style={{ background: "#EEF2FF", color: "#6366F1" }}
            >
              Reschedule
            </button>
            <button
              onClick={handleDelete}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              className="custom-select text-xs font-semibold text-slate-600 px-3 py-2 rounded-lg outline-none"
              style={{ background: "#F8FAFF", border: "1.5px solid #E0E7FF", minWidth: "130px" }}
              value={record.assignedDoctorId || ""}
              onChange={(e) =>
                setOpdRecords((prev) =>
                  prev.map((r) => r._id === record._id ? { ...r, assignedDoctorId: e.target.value } : r)
                )
              }
            >
              <option value="" disabled>Select Doctor</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>{doc.fullName}</option>
              ))}
            </select>
            <button
              disabled={!record.assignedDoctorId}
              onClick={() => assignDoctorsHandler(record)}
              className="text-xs font-extrabold px-3 py-2 rounded-lg text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 flex items-center gap-1"
              style={{ background: "linear-gradient(135deg,#6366F1,#818CF8)", boxShadow: "0 2px 8px rgba(99,102,241,0.25)" }}
            >
              Assign <ArrowRight size={12} />
            </button>
            <button
              onClick={handleDelete}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default AdminDashboard;