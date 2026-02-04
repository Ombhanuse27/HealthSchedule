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
  Filter
} from "lucide-react";

// ✅ Import API functions
// import { 
//   getOpdRecords, 
//   getDoctorsData, 
//   assignDoctors, 
//   getLoggedInHospital, 
//   deleteOpdRecord,
//   delayAppointments

// } from "../../api/api";

import { getOpdRecords } from "../../api/opdApi";
import { getDoctorsData } from "../../api/doctorApi";
import { assignDoctors } from "../../api/adminApi";
import { getLoggedInHospital } from "../../api/adminApi";
import { deleteOpdRecord, delayAppointments } from "../../api/opdApi";

import { rescheduleOpdAppointment } from "../../api/opdApi";


// --- Helper Functions (UNCHANGED) ---

const getTodayDate = () => {
  return new Date().toLocaleDateString("en-CA");
};

const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  if (typeof timeStr !== 'string') return 0;

  const [time, period] = timeStr.split(" ");
  if (!time || !period) return 0;

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

const formatTime = (totalMinutes) => {
  let hour = Math.floor(totalMinutes / 60);
  let minute = totalMinutes % 60;
  const period = hour >= 12 ? "PM" : "AM";

  if (hour === 0) {
    hour = 12; // 12 AM (Midnight)
  } else if (hour > 12) {
    hour -= 12;
  }

  const minuteStr = minute.toString().padStart(2, '0');
  return `${hour}:${minuteStr} ${period}`;
};

const generateTimeSlots = (startTimeStr, endTimeStr) => {
  if (!startTimeStr || !endTimeStr) return [];

  const startMinutes = parseTime(startTimeStr);
  const endMinutes = parseTime(endTimeStr);
  const slotDuration = 3 * 60; // 3 hours
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





  const getNextAvailableSlots = (currentSlot) => {
    const index = timeSlots.findIndex((slot) => slot === currentSlot);
    if (index === -1) return [];
    return timeSlots.slice(index + 1);
  };

  // --- 🆕 Helper for Date Selection (Today until Saturday) ---
  const getAvailableRescheduleDates = () => {
    const dates = [];
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntilSaturday = 6 - currentDay;

    for (let i = 0; i <= daysUntilSaturday; i++) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + i);
      const isoDate = nextDate.toLocaleDateString("en-CA");
      const label = i === 0 ? "Today" : nextDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      dates.push({ isoDate, label });
    }
    return dates;
  };

  // --- Inside AdminDashboard Component ---

  const handleReschedule = async () => {
    if (!newSlot || !rescheduleRecord || !rescheduleDate) {
      alert("Please select both date and time slot.");
      return;
    }

    try {
      setRescheduling(true);
      const token = localStorage.getItem("token");

      const response = await rescheduleOpdAppointment(
        rescheduleRecord._id,
        {
          newSlot: newSlot,
          newDate: rescheduleDate
        },
        token
      );

      console.log("Reschedule API Response:", response); // Debugging

      // ✅ FIX: check response.appointment OR response.data.appointment depending on your axios wrapper
      const updatedAppt = response?.appointment || response?.data?.appointment;

      if (updatedAppt) {
        // 🔄 Update state first
        setOpdRecords((prev) =>
          prev.map((r) => {
            if (r && r._id === rescheduleRecord._id) {
              return {
                ...r,
                appointmentDate: updatedAppt.appointmentDate,
                preferredSlot: updatedAppt.preferredSlot,
                appointmentTime: updatedAppt.appointmentTime,
              };
            }
            return r;
          })
        );

        // ✅ Call Alert AFTER state update to ensure it pops up
        alert(response?.message || "Appointment rescheduled successfully!");

        // Close modal and reset
        setRescheduleRecord(null);
        setNewSlot("");
        setRescheduleDate("");
      } else {
        throw new Error("Backend did not return updated appointment data.");
      }

    } catch (error) {
      console.error("Reschedule Error:", error);
      alert(error.response?.data?.message || error.message || "Failed to reschedule appointment");
    } finally {
      setRescheduling(false);
    }
  };

  // --- Update Filtering Logic ---

  const filteredRecords = opdRecords.filter((record) => {
    // ✅ CHECK 3: Ensure record exists before accessing properties
    if (!record) return false;

    const matchesDoctor = selectedDoctorId
      ? (record.assignedDoctor && (record.assignedDoctor._id === selectedDoctorId || record.assignedDoctor === selectedDoctorId))
      : true;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (record.fullName?.toLowerCase() || "").includes(query) ||
      (record.diagnosis?.toLowerCase() || "").includes(query) ||
      (record.contactNumber || "").includes(query);

    return matchesDoctor && matchesSearch;
  });

  // ✅ CHECK 4: Filter out nulls before getting unique dates
  const uniqueDates = [...new Set(filteredRecords.map((record) => record?.appointmentDate).filter(Boolean))];
  uniqueDates.sort((a, b) => b.localeCompare(a));

  const datesToShow = selectedDate ? [selectedDate] : uniqueDates;

  const getRecordsForDateAndSlot = (date, slot) => {
    const [startStr, endStr] = slot.split(" - ");
    const slotStartMin = parseTime(startStr);
    const slotEndMin = parseTime(endStr);

    // ✅ FIX: Filter from 'filteredRecords' so the search actually works in the slots
    return filteredRecords.filter(record => {
      if (!record || record.appointmentDate !== date) return false;
      const apptMin = parseTime(record.appointmentTime);
      return apptMin >= slotStartMin && apptMin < slotEndMin;
    }).sort((a, b) => parseTime(a.appointmentTime) - parseTime(b.appointmentTime));
  };
  const applyDelay = async (minutes) => {
    if (!window.confirm(`Delay all upcoming appointments by ${minutes} minutes?`)) return;

    try {
      const res = await delayAppointments(minutes, token);
      alert(res.data.message);

      // 🔄 Refresh data
      const updated = await getOpdRecords(token);

      const populated = updated.data.map(record => {
        if (record.assignedDoctor) {
          const doctor = doctors.find(
            d => d._id === record.assignedDoctor
          );
          if (doctor) {
            return { ...record, assignedDoctor: doctor };
          }
        }
        return record;
      });

      setOpdRecords(populated);

    } catch (err) {
      alert("Failed to apply delay");
    }
  };


  const token = localStorage.getItem("token");
  const todayStr = getTodayDate();

  const assignDoctorsHandler = async (record) => {
    if (!record.assignedDoctorId) {
      alert("Please select a doctor before sending.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to assign ${record.fullName}'s appointment to the selected doctor?`
    );
    if (!confirmed) return;
    try {
      await assignDoctors(record._id, record.assignedDoctorId, token);
      alert("Appointment successfully assigned to the doctor!");

      const assignedDoctorObject = doctors.find(doc => doc._id === record.assignedDoctorId);

      setOpdRecords(prevRecords =>
        prevRecords.map(r =>
          r._id === record._id
            ? { ...r, assignedDoctor: assignedDoctorObject }
            : r
        )
      );
    } catch (error) {
      alert("Failed to assign appointment.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: hospitalData } = await getLoggedInHospital(token);
        if (!hospitalData || !hospitalData.username) {
          throw new Error("Could not determine the logged-in hospital.");
        }
        const hospitalUsername = hospitalData.username;

        if (hospitalData.hospitalStartTime && hospitalData.hospitalEndTime) {
          const slots = generateTimeSlots(hospitalData.hospitalStartTime, hospitalData.hospitalEndTime);
          setTimeSlots(slots);
        }

        const [opdResponse, allDoctorsData] = await Promise.all([
          getOpdRecords(token),
          getDoctorsData(token)
        ]);

        const opdData = opdResponse.data;
        const filteredDoctors = allDoctorsData.filter(doc => doc.hospital === hospitalUsername);
        setDoctors(filteredDoctors);

        const populatedOpdRecords = opdData.map(record => {
          if (record.assignedDoctor) {
            const doctorDetails = allDoctorsData.find(doc => doc._id === record.assignedDoctor);
            if (doctorDetails) {
              return { ...record, assignedDoctor: doctorDetails };
            }
          }
          return record;
        });

        setOpdRecords(Array.isArray(populatedOpdRecords) ? populatedOpdRecords : []);

      } catch (error) {
        alert("Error fetching dashboard data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  // --- Filtering Logic (UNCHANGED) ---

  const doctorFilteredRecords = selectedDoctorId
    ? opdRecords.filter(record =>
      (record.assignedDoctor && record.assignedDoctor._id === selectedDoctorId) ||
      record.assignedDoctor === selectedDoctorId
    )
    : opdRecords;






  const getUncategorizedRecordsForDate = (date) => {
    if (timeSlots.length === 0) {
      return doctorFilteredRecords.filter(r => r.appointmentDate === date);
    }

    const allSlotRanges = timeSlots.map(slot => {
      const [startStr, endStr] = slot.split(" - ");
      return { start: parseTime(startStr), end: parseTime(endStr) };
    });

    return doctorFilteredRecords.filter(record => {
      if (record.appointmentDate !== date) return false;
      const apptMin = parseTime(record.appointmentTime);
      const fitsInSlot = allSlotRanges.some(range => apptMin >= range.start && apptMin < range.end);
      return !fitsInSlot;
    }).sort((a, b) => parseTime(a.appointmentTime) - parseTime(b.appointmentTime));
  };

  return (
    <div className="flex flex-1">
      {/* 🎨 UI UPDATE: 
         - Changed background to a fresh gradient (Teal to Blue to White)
         - Added proper scrolling behavior 
      */}
      <div className="p-4 md:p-10 bg-gradient-to-br from-teal-50 via-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col gap-6 flex-1 w-full h-screen overflow-y-auto">
        {loading ? (
          <div className="flex flex-1 justify-center items-center flex-col gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 shadow-lg"></div>
            <p className="text-teal-600 font-medium animate-pulse">Loading Hospital Records...</p>
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-400 dark:to-blue-400 uppercase tracking-tight">
                  Appointment Dashboard
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Manage patient appointments and doctor assignments.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">System Live</span>
              </div>
            </div>
            {/* 🔥 UPDATED: Only show Delay buttons if viewing TODAY */}
            {selectedDate === todayStr && filteredRecords.some(r => r.appointmentDate === todayStr) && (
              <div className="flex gap-3 mb-6 bg-amber-50 p-4 rounded-xl border border-amber-100 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="text-amber-600 animate-pulse" size={20} />
                  <div>
                    <h3 className="font-bold text-amber-800">Running Late?</h3>
                    <p className="text-xs text-amber-600">Apply a time delay to all upcoming appointments for <strong>TODAY</strong>.</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => applyDelay(5)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2"
                  >
                    +5 Min
                  </button>

                  <button
                    onClick={() => applyDelay(10)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2"
                  >
                    +10 Min
                  </button>
                </div>
              </div>
            )}


            {/* 🎨 UI UPDATE: Glassmorphism Control Bar */}
            <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700 p-4 mb-8 transition-all hover:shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">

                {/* Search */}
                <div className="relative w-full md:w-1/3 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-3 rounded-xl bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-gray-700 transition-all shadow-inner"
                    placeholder="Search name, phone, or diagnosis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">

                  {/* Doctor Filter */}
                  <div className="relative w-full md:w-56">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Stethoscope className="h-4 w-4 text-slate-500" />
                    </div>
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 appearance-none rounded-xl bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm cursor-pointer"
                    >
                      <option value="">All Doctors</option>
                      {doctors.map((doc) => (
                        <option key={doc._id} value={doc._id}>
                          {doc.fullName}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Filter className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Date Filter */}
                  <div className="relative w-full md:w-56">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-slate-500" />
                    </div>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 appearance-none rounded-xl bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm cursor-pointer"
                    >
                      <option value="">All Dates</option>
                      <option value={todayStr} className="font-bold">Today ({todayStr})</option>
                      {uniqueDates
                        .filter(date => date !== todayStr)
                        .map((date) => (
                          <option key={date} value={date}>
                            {date}
                          </option>
                        ))}
                    </select>
                  </div>

                </div>
              </div>
            </div>

            {/* ✅ MAIN RENDER LOOP */}
            {datesToShow.length > 0 ? (
              datesToShow.map((date) => (
                <div key={date} className="mb-12">

                  {/* 🎨 UI UPDATE: Enhanced Date Header */}
                  <div className="flex items-center gap-4 mb-6 sticky top-28 z-10 bg-gradient-to-r from-teal-50/90 to-blue-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-sm py-2 px-4 rounded-lg border-l-4 border-teal-500 shadow-sm">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg text-teal-600 dark:text-teal-300">
                      <Calendar size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                      {date === todayStr ? <span className="text-teal-600">Today,</span> : ""} {date}
                    </h2>
                  </div>

                  {/* Slots Grid */}
                  <div className="flex flex-col gap-8">
                    {timeSlots.map((slot, index) => {
                      const recordsInSlot = getRecordsForDateAndSlot(date, slot);
                      if (recordsInSlot.length === 0) return null;

                      return (
                        <div key={index} className="group w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-100 dark:border-gray-700">
                          {/* Slot Header */}
                          <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 border-b border-slate-100 dark:border-slate-600 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                              <Clock className="text-teal-500" size={20} />
                              {slot}
                            </h3>
                            <span className="text-xs font-bold bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300 px-3 py-1 rounded-full shadow-sm">
                              {recordsInSlot.length} Patient{recordsInSlot.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <AppointmentTable
                            records={recordsInSlot}
                            doctors={doctors}
                            assignDoctorsHandler={assignDoctorsHandler}
                            setOpdRecords={setOpdRecords}
                            setRescheduleRecord={setRescheduleRecord}
                            setNewSlot={setNewSlot}
                          />

                        </div>
                      );
                    })}

                    {/* Uncategorized */}
                    {getUncategorizedRecordsForDate(date).length > 0 && (
                      <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border-2 border-amber-100 dark:border-amber-900">
                        <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-4 border-b border-amber-100 dark:border-amber-800 flex items-center gap-2">
                          <AlertCircle className="text-amber-500" />
                          <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200">
                            Unscheduled / Other Times
                          </h3>
                        </div>
                        <AppointmentTable
                          records={getUncategorizedRecordsForDate(date)}
                          doctors={doctors}
                          assignDoctorsHandler={assignDoctorsHandler}
                          setOpdRecords={setOpdRecords}
                        />
                      </div>
                    )}

                    {/* Empty State for specific filter */}
                    {getUncategorizedRecordsForDate(date).length === 0 &&
                      timeSlots.every(slot => getRecordsForDateAndSlot(date, slot).length === 0) && (
                        <div className="p-8 text-center bg-white/50 rounded-xl border border-dashed border-slate-300 mx-4">
                          <p className="text-slate-500 italic">No appointments match the current filter for this date.</p>
                        </div>
                      )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-slate-100 dark:border-gray-700 text-center">
                <div className="bg-slate-100 dark:bg-gray-700 p-6 rounded-full mb-4">
                  <UserCheck size={48} className="text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-700 dark:text-white mb-2">No Records Found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                  There are no appointments scheduled for the selected date or doctor filter. Try adjusting your search criteria.
                </p>
              </div>
            )}

            {children}

            {rescheduleRecord && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-100 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center gap-3 mb-4 text-teal-600">
                    <Calendar size={24} />
                    <h3 className="text-xl font-bold dark:text-white">Reschedule Appointment</h3>
                  </div>

                  <div className="space-y-5">
                    {/* 1. Date Picker */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select New Date</label>
                      <select
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                        value={rescheduleDate}
                        onChange={(e) => {
                          setRescheduleDate(e.target.value);
                          setNewSlot(""); // Reset slot when date changes
                        }}
                      >
                        <option value="">Choose a date...</option>
                        {getAvailableRescheduleDates().map((date) => (
                          <option key={date.isoDate} value={date.isoDate}>
                            {date.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Slot Picker */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Time Slot</label>
                      <select
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 outline-none transition-all disabled:opacity-50"
                        value={newSlot}
                        onChange={(e) => setNewSlot(e.target.value)}
                        disabled={!rescheduleDate}
                      >
                        <option value="">{rescheduleDate ? "Choose a slot..." : "Select date first"}</option>
                        {/* Logic: If selecting today, filter past slots. If future, show all. */}
                        {(rescheduleDate !== todayStr
                          ? timeSlots
                          : getNextAvailableSlots(rescheduleRecord.preferredSlot)
                        ).map((slot, index) => (
                          <option key={index} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-700">
                        <strong>Current:</strong> {rescheduleRecord.appointmentDate} at {rescheduleRecord.appointmentTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                    <button
                      onClick={() => {
                        setRescheduleRecord(null);
                        setRescheduleDate("");
                      }}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>

                    <button
                      disabled={!newSlot || !rescheduleDate || rescheduling}
                      onClick={handleReschedule}
                      className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 active:scale-95 disabled:opacity-50 transition-all"
                    >
                      {rescheduling ? "Updating..." : "Confirm Reschedule"}
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

// ✅ Extracted Table
const AppointmentTable = ({
  records,
  doctors,
  assignDoctorsHandler,
  setOpdRecords,
  setRescheduleRecord,
  setNewSlot,
}) => (

  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead className="hidden md:table-header-group">
        <tr className="bg-white dark:bg-gray-800 text-slate-500 dark:text-slate-400 text-left text-xs uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-gray-700">
          <th className="p-5 pl-6">Patient Details</th>
          <th className="p-5">diagnosis</th>
          <th className="p-5">Ref. No</th>
          <th className="p-5">Contact</th>
          <th className="p-5">Time</th>
          <th className="p-5">Action / Doctor</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50 dark:divide-gray-700 md:divide-slate-100">
        {records.map((record) => (
          <AppointmentRow
            key={record._id}
            record={record}
            doctors={doctors}
            assignDoctorsHandler={assignDoctorsHandler}
            setOpdRecords={setOpdRecords}
            setRescheduleRecord={setRescheduleRecord}
            setNewSlot={setNewSlot}
          />

        ))}
      </tbody>
    </table>
  </div>
);

// Row Component
const AppointmentRow = ({
  record,
  doctors,
  assignDoctorsHandler,
  setOpdRecords,
  setRescheduleRecord,
  setNewSlot,
}) => {

  const token = localStorage.getItem("token");
  const isAssigned = record.assignedDoctor && record.assignedDoctor.fullName;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${record.fullName}'s appointment?`
    );
    if (!confirmed) return;

    try {
      await deleteOpdRecord(record._id, token);
      alert("Appointment deleted successfully!");
      setOpdRecords((prev) => prev.filter((r) => r._id !== record._id));
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete the appointment.");
    }
  };

  return (
    <tr className="block md:table-row bg-white dark:bg-gray-800 hover:bg-teal-50/30 dark:hover:bg-gray-700/30 transition-colors group">

      {/* Patient Name & Age */}
      <td className="block md:table-cell p-5 pl-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-teal-400 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {record.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-white text-base">{record.fullName}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><User size={12} /> {record.age} Yrs</span>
              <span>•</span>
              <span className="capitalize">{record.gender || 'N/A'}</span>
            </div>
          </div>
        </div>
      </td>

      {/* diagnosis */}
      <td className="block md:table-cell p-5">
        <span className="md:hidden font-bold text-slate-500 text-xs uppercase mb-1 block">diagnosis:</span>
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 max-w-xs" title={record.diagnosis}>
          {record.diagnosis || "No diagnosis listed"}
        </p>
      </td>

      {/* Ref No */}
      <td className="block md:table-cell p-5">
        <span className="md:hidden font-bold text-slate-500 text-xs uppercase mb-1 block">Ref No:</span>
        <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-gray-700 rounded text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-gray-600">
          #{record.appointmentNumber}
        </span>
      </td>

      <td className="block md:table-cell p-5">
        <span className="md:hidden font-bold text-slate-500 text-xs uppercase mb-1 block">Contact:</span>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {record.contactNumber || "N/A"}
        </p>
      </td>

      {/* Time */}
      <td className="block md:table-cell p-5">
        <span className="md:hidden font-bold text-slate-500 text-xs uppercase mb-1 block">Time:</span>
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
          <Clock size={16} className="text-teal-500" />
          {record.appointmentTime}
        </div>
      </td>

      {/* Action Column */}
      <td className="block md:table-cell p-5">
        <span className="md:hidden font-bold text-slate-500 text-xs uppercase mb-1 block">Action:</span>
        {isAssigned ? (
          <div className="flex items-center justify-between md:justify-start gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300">
              <UserCheck size={16} />
              <span className="text-sm font-semibold">{record.assignedDoctor.fullName}</span>
            </div>
            <button
              onClick={handleDelete}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Delete Appointment"
            >
              <Trash2 size={18} />
            </button>

            <button
              onClick={() => {
                setRescheduleRecord(record);
                setNewSlot("");
              }}
              className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              Reschedule
            </button>



          </div>


        ) : (
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <div className="relative">
              <select
                className="w-full sm:w-40 pl-2 pr-8 py-2 text-sm rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none shadow-sm transition-all"
                value={record.assignedDoctorId || ""}
                onChange={(e) => {
                  const selectedDoctorId = e.target.value;
                  setOpdRecords((prev) =>
                    prev.map((r) =>
                      r._id === record._id
                        ? { ...r, assignedDoctorId: selectedDoctorId }
                        : r
                    )
                  );
                }}
              >
                <option value="" disabled>Select Doctor</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.fullName}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-md hover:shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              onClick={() => assignDoctorsHandler(record)}
              disabled={!record.assignedDoctorId}
            >
              Assign
            </button>

            <button
              onClick={handleDelete}
              className="px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
              title="Delete Appointment"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default AdminDashboard;