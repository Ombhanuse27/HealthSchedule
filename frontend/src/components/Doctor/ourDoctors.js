import { Link } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import doctorone from '../../images/doctor-6.jpg';
import { getDoctorsData } from "../../api/doctorApi";
import { getHospitalsData } from "../../api/hospitalApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSortAmountDown, faUserMd, faPhone, faEnvelope, faCalendarCheck } from "@fortawesome/free-solid-svg-icons";

function OurDoctors({ hospitalId }) {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  
  // State for interactivity
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("fullName-asc");

  useEffect(() => {
    if (!hospitalId) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const [doctorsData, hospitalsData] = await Promise.all([
          getDoctorsData(),
          getHospitalsData() 
        ]);
        const currentHospital = hospitalsData.find(h => String(h.hospitalId) === hospitalId);
        
        if (!currentHospital) {
          console.error("Hospital not found with ID:", hospitalId);
          setDoctors([]);
          return;
        }

        const hospitalNameToFilter = currentHospital.username;
        const filteredByHospital = doctorsData.filter(doc => 
          doc.hospital && doc.hospital.toLowerCase() === hospitalNameToFilter.toLowerCase()
        );
        setDoctors(filteredByHospital);
      } catch (error) {
        alert("Error fetching data");
        console.error(error);
      } finally {   
        setLoading(false);
      }
    };
    fetchData();
  }, [hospitalId]);

  // Memoized derivation of state for performance
  const filteredAndSortedDoctors = useMemo(() => {
    return doctors
      .filter((doc) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          doc.fullName.toLowerCase().includes(searchLower) ||
          doc.specialization.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "fullName-desc":
            return b.fullName.localeCompare(a.fullName);
          case "specialization-asc":
            return a.specialization.localeCompare(b.specialization);
          case "specialization-desc":
            return b.specialization.localeCompare(a.specialization);
          case "fullName-asc":
          default:
            return a.fullName.localeCompare(b.fullName);
        }
      });
  }, [doctors, searchTerm, sortBy]);

  // If loading, show a sleek spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // If no doctors exist for this hospital at all (before filtering)
  if (doctors.length === 0) {
    return null; // Hide the section entirely if no doctors are assigned
  }

  return (
    <div className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden mb-12">
      
      {/* Header & Controls Section */}
      <div className="p-8 lg:p-10 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Title */}
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg">
                <FontAwesomeIcon icon={faUserMd} />
              </div>
              Our Specialists
            </h2>
            <p className="text-gray-500 text-sm mt-2 font-medium">Meet the expert healthcare professionals at this facility.</p>
          </div>
          
          {/* Interactive Controls */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            
            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
              <input
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none text-sm text-gray-700 shadow-sm"
                placeholder="Search name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative w-full sm:w-56">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSortAmountDown} className="text-gray-400" />
              </div>
              <select
                className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none text-sm text-gray-700 appearance-none cursor-pointer shadow-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="fullName-asc">Name (A-Z)</option>
                <option value="fullName-desc">Name (Z-A)</option>
                <option value="specialization-asc">Specialty (A-Z)</option>
                <option value="specialization-desc">Specialty (Z-A)</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="p-8 lg:p-10">
        {filteredAndSortedDoctors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedDoctors.map((doc, index) => {
              const assignedCount = doc.assignedAppointments?.length || 0;
              const maxSlots = 10;
              const percentFilled = Math.min((assignedCount / maxSlots) * 100, 100);
              const isFull = assignedCount >= maxSlots;

              return (
                <div key={doc._id || index} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden">
                  
                  {/* Doctor Image & Badge */}
                  <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
                    <img 
                      src={doc.photo || doctorone} 
                      alt={doc.fullName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-blue-700 font-bold px-3 py-1.5 rounded-full text-[10px] tracking-wide uppercase shadow-sm">
                      {doc.specialization}
                    </div>
                  </div>

                  {/* Doctor Details */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h4 className="text-lg font-extrabold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {doc.fullName}
                    </h4>
                    
                    <div className="space-y-3 mb-6">
                      {/* Phone */}
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400 w-4 flex justify-center text-sm">
                          <FontAwesomeIcon icon={faPhone} />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">{doc.phone}</span>
                      </div>
                      
                      {/* Email */}
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400 w-4 flex justify-center text-sm">
                          <FontAwesomeIcon icon={faEnvelope} />
                        </div>
                        <span className="text-sm text-gray-600 truncate" title={doc.email}>{doc.email}</span>
                      </div>
                    </div>

                    {/* Appointments Progress Bar */}
                    <div className="mt-auto bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faCalendarCheck} /> Bookings
                        </span>
                        <span className={`text-xs font-bold ${isFull ? 'text-red-500' : 'text-blue-600'}`}>
                          {assignedCount} / {maxSlots}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                          style={{ width: `${percentFilled}%` }}
                        ></div>
                      </div>
                    </div>

                  </div>

                  {/* Action Button */}
                  <div className="p-5 pt-0 mt-auto">
                    <Link 
                      to="/opdForm" 
                      className={`block w-full py-3 rounded-xl font-bold text-sm text-center transition-all ${
                        isFull 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/30'
                      }`}
                      onClick={(e) => isFull && e.preventDefault()} // Prevent clicking if full
                    >
                      {isFull ? 'Fully Booked' : 'Book Appointment'}
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <FontAwesomeIcon icon={faUserMd} className="text-3xl text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No Specialists Found</h3>
            <p className="text-gray-500 text-sm mt-1">We couldn't find any doctors matching your search.</p>
            <button 
              onClick={() => { setSearchTerm(""); setSortBy("fullName-asc"); }}
              className="mt-4 text-blue-600 font-semibold text-sm hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OurDoctors;