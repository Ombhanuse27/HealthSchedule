import React, { useEffect, useState } from "react";
import HospitalCard from "./HospitalCard.js";
import doctorone from "../../images/doctor-6.jpg";
import "./Hospital.css"; 
import Footer from "../Footer/Footer.js";
import NavbarLink from "../Navbar/NavbarLink.js"; 
import { getHospitalsData } from "../../api/hospitalApi.js";

const Hospital = () => {
  const [HospitalList, setHospitalList] = useState([]); 
  const [filteredHospitals, setFilteredHospitals] = useState([]); 
  const [cities, setCities] = useState([]); 
  const [selectedCity, setSelectedCity] = useState(""); 
  const [searchTerm, setSearchTerm] = useState(""); 

  // 1. Fetch data and populate lists
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await getHospitalsData(); 

        const formattedHospitals = data.map((hospital) => {
          const start = hospital.hospitalStartTime || "9:00 AM";
          const end = hospital.hospitalEndTime || "5:00 PM";
          return {
            id: hospital._id,
            hospital_img: hospital.hospitalImage || doctorone,
            hospital_name: hospital.hospitalName,
            hospital_location: hospital.address,
            hospital_city: hospital.city, 
            hospital_phone_number: hospital.contactNumber,
            hospital_speciality: hospital.Specialist,
            hospital_timing: `${start} - ${end}`,
          };
        });

        const uniqueCities = [
          ...new Set(formattedHospitals.map((h) => h.hospital_city).filter(Boolean)),
        ].sort();

        setCities(uniqueCities);
        setHospitalList(formattedHospitals); 
        setFilteredHospitals(formattedHospitals); 
      } catch (error) {
        console.error("Error fetching hospital data:", error);
      }
    };

    fetchHospitals();
  }, []);

  // 2. Filter logic effect
  useEffect(() => {
    let result = HospitalList;

    if (selectedCity) {
      result = result.filter(
        (hospital) => hospital.hospital_city === selectedCity
      );
    }

    if (searchTerm) {
      result = result.filter(
        (hospital) =>
          hospital.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hospital.hospital_speciality?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredHospitals(result);
  }, [selectedCity, searchTerm, HospitalList]); 

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 font-sans selection:bg-blue-200 selection:text-blue-900">
      <NavbarLink />
      
      {/* INCREASED TOP PADDING: pt-40 and lg:pt-48 to ensure a beautiful distance below the navbar */}
      <div className="flex-grow pt-40 lg:pt-48 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto w-full">
        
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Find a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Hospital</span>
          </h1>
          <p className="mt-3 text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
            Search by name, specialty, or city to find the right healthcare facility for your needs.
          </p>
        </div>
      
        {/* Sleek Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-8">
          
          {/* Search Input */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by hospital name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* City Filter Dropdown */}
          <div className="md:w-64 flex-shrink-0">
            <div className="relative h-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none text-sm text-gray-700 appearance-none cursor-pointer"
              >
                <option value="">All Cities</option>
                {cities.map((city, index) => (
                  <option key={index} value={city}>{city}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Hospital Grid or Empty State */}
        {filteredHospitals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {filteredHospitals.map((hospital, index) => (
              <HospitalCard key={index} id={hospital.id} {...hospital} />
            ))}
          </div>
        ) : (
          /* FIXED EMPTY STATE ICON & SPACING */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-8">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-5">
              {/* Clean "Search Not Found" SVG */}
              <svg className="w-10 h-10 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 4h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">No hospitals found</h3>
            <p className="text-gray-500 mt-2 max-w-sm text-sm">
              We couldn't find any facilities matching your current search criteria. Try adjusting your filters or clearing the search bar.
            </p>
            <button 
              onClick={() => { setSearchTerm(""); setSelectedCity(""); }}
              className="mt-6 px-6 py-2.5 bg-blue-50 text-blue-600 font-semibold text-sm rounded-xl hover:bg-blue-100 transition-colors"
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