import React, { useEffect, useState } from "react";
import HospitalCard from "./HospitalCard.js";
import doctorone from "../../images/doctor-6.jpg";
import "./Hospital.css";
import Footer from "../Footer/Footer.js";
import { getHospitalsData } from "../../api/hospitalApi.js";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";

const Hospital = () => {
  const [HospitalList, setHospitalList] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await getHospitalsData();
        const formatted = data.map((hospital) => ({
          id: hospital._id,
          hospital_img: hospital.hospitalImage || doctorone,
          hospital_name: hospital.hospitalName,
          hospital_location: hospital.address,
          hospital_city: hospital.city,
          hospital_phone_number: hospital.contactNumber,
          hospital_speciality: hospital.Specialist,
          hospital_timing: `${hospital.hospitalStartTime || "9:00 AM"} - ${hospital.hospitalEndTime || "5:00 PM"}`,
        }));
        const uniqueCities = [...new Set(formatted.map((h) => h.hospital_city).filter(Boolean))].sort();
        setCities(uniqueCities);
        setHospitalList(formatted);
        setFilteredHospitals(formatted);
      } catch (error) {
        console.error("Error fetching hospital data:", error);
      }
    };
    fetchHospitals();
  }, []);

  useEffect(() => {
    let result = HospitalList;
    if (selectedCity) result = result.filter((h) => h.hospital_city === selectedCity);
    if (searchTerm) result = result.filter((h) =>
      h.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.hospital_speciality?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHospitals(result);
  }, [selectedCity, searchTerm, HospitalList]);

  const hasFilters = searchTerm || selectedCity;

  return (
    // ── NO <NavbarLink /> here — it lives in App.js globally
    // ── NO pt-40/pt-48 — App.js already offsets pt-[88px] for the fixed navbar
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-blue-50 to-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .hospital-page * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up   { animation: fadeUp 0.45s ease both; }
        .fade-up-2 { animation: fadeUp 0.45s 0.08s ease both; }
        .fade-up-3 { animation: fadeUp 0.45s 0.16s ease both; }
        .custom-select { appearance:none; }
        .input-focus:focus { border-color:#6366F1 !important; box-shadow:0 0 0 3px rgba(99,102,241,0.12); outline:none; }
      `}</style>

      <div className="hospital-page flex-grow px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto w-full">

        {/* ── Page Header ── */}
        <div className="text-center mb-10 fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Healthcare Directory</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Find a{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg,#4F46E5 0%,#0EA5E9 100%)" }}
            >
              Hospital
            </span>
          </h1>
          <p className="mt-3 text-slate-400 text-base sm:text-lg max-w-xl mx-auto font-medium">
            Search by name, specialty, or city to find the right healthcare facility for your needs.
          </p>
        </div>

        {/* ── Search & Filter Bar ── */}
        <div
          className="fade-up-2 rounded-2xl p-4 flex flex-col md:flex-row gap-3 mb-8"
          style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(99,102,241,0.12)", boxShadow: "0 4px 20px rgba(99,102,241,0.08)" }}
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by hospital name or specialty…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-focus w-full pl-10 pr-10 py-3 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-300 transition-all"
              style={{ background: "#F8FAFF", border: "1.5px solid #E0E7FF" }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                <X size={14} />
              </button>
            )}
          </div>

          {/* City Filter */}
          <div className="relative md:w-56">
            <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="custom-select input-focus w-full pl-10 pr-8 py-3 rounded-xl text-sm font-semibold text-slate-700 cursor-pointer transition-all"
              style={{
                background: "#F8FAFF",
                border: "1.5px solid #E0E7FF",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
              }}
            >
              <option value="">All Cities</option>
              {cities.map((city, i) => <option key={i} value={city}>{city}</option>)}
            </select>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={() => { setSearchTerm(""); setSelectedCity(""); }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-indigo-600 transition-all hover:scale-105 active:scale-95"
              style={{ background: "#EEF2FF", border: "1.5px solid #C7D2FE" }}
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* ── Results count ── */}
        <div className="fade-up-3 flex items-center justify-between mb-5">
          <p className="text-sm font-semibold text-slate-400">
            {filteredHospitals.length > 0
              ? <><span className="text-slate-700 font-bold">{filteredHospitals.length}</span> hospital{filteredHospitals.length !== 1 ? "s" : ""} found</>
              : "No results"
            }
          </p>
          {hasFilters && (
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-500">
              <SlidersHorizontal size={12} /> Filters active
            </div>
          )}
        </div>

        {/* ── Hospital Grid ── */}
        {filteredHospitals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredHospitals.map((hospital, index) => (
              <HospitalCard key={index} id={hospital.id} {...hospital} />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-20 text-center rounded-3xl"
            style={{ background: "#FAFAFE", border: "1.5px dashed #C7D2FE" }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg,#EEF2FF,#E0F2FE)" }}>
              <Search size={28} className="text-indigo-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No hospitals found</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              We couldn't find any facilities matching your criteria. Try adjusting your filters.
            </p>
            <button
              onClick={() => { setSearchTerm(""); setSelectedCity(""); }}
              className="mt-6 px-6 py-2.5 text-sm font-bold text-indigo-600 rounded-xl transition-all hover:scale-105"
              style={{ background: "#EEF2FF", border: "1.5px solid #C7D2FE" }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Hospital;