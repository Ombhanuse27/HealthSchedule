import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Links from "../Navbar/NavbarLink";
import Footer from "../Footer/Footer"; // Restored Footer import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { registerCallIntent } from "../../api/opdApi.js";
import {
  faMapMarkerAlt,
  faPhoneAlt,
  faHospital,
  faClock,
  faStar,
  faStarHalfAlt,
  faStethoscope,
  faBed,
  faMoneyBillWave,
  faCreditCard,
  faShieldAlt,
  faGlobe,
  faEnvelope,
  faInfoCircle,
  faAward,
  faRobot,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import OurDoctors from "../Doctor/ourDoctors";
import { getHospitalsData } from "../../api/hospitalApi.js";
import doctorone from "../../images/doctor-6.jpg";

const AI_AGENT_NUMBER = "+1 361-902-9634";

const HospitalDetails = () => {
  const { hospitalId } = useParams();
  const [hospital, setHospital] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiForm, setAiForm] = useState({ 
    fullName: "", 
    contactNumber: "", 
    age: "", 
    gender: "Male" 
  });
  const [aiStatus, setAiStatus] = useState("idle"); // idle, loading, success, error

  useEffect(() => {
    const fetchHospitalDetails = async () => {
      try {
        const data = await getHospitalsData();
        const selectedHospital = data.find((h) => String(h.hospitalId) === hospitalId);

        if (selectedHospital) {
          // Construct timing string safely
          const startTime = selectedHospital.hospitalStartTime || "9:00 AM";
          const endTime = selectedHospital.hospitalEndTime || "5:00 PM";

          setHospital({
            hospitalImage: selectedHospital.hospitalImage || doctorone,
            hospitalName: selectedHospital.hospitalName || "Unknown Hospital",
            timing: `${startTime} - ${endTime}`,
            address: selectedHospital.address || "Address not available",
            contactNumber: selectedHospital.contactNumber || "Not available",
            rating: selectedHospital.rating || "4.5",
            aboutHospital: selectedHospital.aboutHospital,
            specialist: selectedHospital.Specialist,
            numberOfBeds: selectedHospital.numberOfBeds,
            opdFees: selectedHospital.opdFees,
            paymentMode: selectedHospital.paymentMode,
            facilities: selectedHospital.facilities,
            insuranceAccepted: selectedHospital.insuranceAccepted,
            accreditations: selectedHospital.accreditations,
            website: selectedHospital.website,
            email: selectedHospital.email,
            experience: selectedHospital.experience
          });
        }
      } catch (error) {
        console.error("Error fetching hospital details:", error);
      }
    };

    fetchHospitalDetails();
  }, [hospitalId]);

  // --- AI FORM HANDLER ---
  const handleAiRegister = async (e) => {
    e.preventDefault();
    setAiStatus("loading");
    try {
        await registerCallIntent({
            fullName: aiForm.fullName,
            contactNumber: aiForm.contactNumber,
            age: aiForm.age,
            gender: aiForm.gender,
            hospitalId: hospitalId,
            hospitalName: hospital.hospitalName
        });
        setAiStatus("success");
    } catch (error) {
        console.error("AI Register Error:", error);
        setAiStatus("error");
    }
  };

  if (!hospital) {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
    );
  }

  // Common input styling for the modal
  const inputClass = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 outline-none text-sm text-gray-700";

  return (
    // Changed pb-16 to pb-0 because the Footer will handle the bottom spacing now
    <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen flex flex-col font-sans selection:bg-blue-200 selection:text-blue-900">
      <Links />
      
      {/* flex-grow pushes the footer to the bottom. Container pushed down to clear Navbar */}
      <div className="flex-grow pt-32 lg:pt-40 pb-16 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        
        {/* --- Main Hero Card --- */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col md:flex-row mb-10">
          {/* Hospital Image */}
          <div className="w-full md:w-5/12 lg:w-2/5 h-64 md:h-auto relative bg-gray-100">
            <img 
              src={hospital.hospitalImage} 
              alt={hospital.hospitalName} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Rating Badge Overlay */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
              <div className="text-yellow-400 text-xs flex gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} />
                ))}
                <FontAwesomeIcon icon={faStarHalfAlt} />
              </div>
              <span className="text-sm font-bold text-gray-800">{hospital.rating}</span>
            </div>
          </div>

          {/* Hospital Info */}
          <div className="w-full md:w-7/12 lg:w-3/5 p-8 lg:p-10 flex flex-col justify-center">
            {/* CORRECTED BADGE: "Hospital" instead of "Medical Center" */}
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <FontAwesomeIcon icon={faHospital} className="text-lg" />
              <span className="text-sm font-bold tracking-wider uppercase">Hospital</span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              {hospital.hospitalName}
            </h1>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3 text-gray-600">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-1 text-red-500 w-4" /> 
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(hospital.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors leading-snug"
                >
                  {hospital.address}
                </a>
              </div>
              
              <div className="flex items-center gap-3 text-gray-600">
                <FontAwesomeIcon icon={faPhoneAlt} className="text-green-500 w-4" /> 
                <a href={`tel:${hospital.contactNumber}`} className="hover:text-blue-600 font-medium transition-colors">
                  {hospital.contactNumber}
                </a>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <FontAwesomeIcon icon={faClock} className="text-blue-400 w-4" /> 
                <span>{hospital.timing}</span>
              </div>
            </div>

            <div className="mt-auto">
              <button 
                onClick={() => setShowAiModal(true)}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
              >
                <FontAwesomeIcon icon={faRobot} className="text-lg" /> 
                Book via AI Agent
              </button>
            </div>
          </div>
        </div>

        {/* --- DETAILS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Section 1: About & Facilities */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </div>
                  About Hospital
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  {hospital.aboutHospital || "No detailed description available for this facility."}
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                  <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                    <FontAwesomeIcon icon={faStethoscope} />
                  </div>
                  Facilities & Specialties
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hospital.specialist && (
                      <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
                          <span className="text-xs font-bold uppercase tracking-wider text-blue-500 block mb-1">Specialist In</span>
                          <span className="text-gray-800 font-medium">{hospital.specialist}</span>
                      </div>
                  )}
                  {hospital.facilities && (
                      <div className="bg-green-50/50 border border-green-100 p-4 rounded-2xl">
                          <span className="text-xs font-bold uppercase tracking-wider text-green-600 block mb-1">Facilities</span>
                          <span className="text-gray-800 font-medium">{hospital.facilities}</span>
                      </div>
                  )}
              </div>
            </div>
          </div>

          {/* Section 2: Quick Info & Finances */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-full">
              <h3 className="text-xl font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                Overview
              </h3>
              
              <ul className="space-y-5">
                  {hospital.opdFees && (
                      <li className="flex items-center justify-between">
                          <span className="text-gray-500 text-sm flex items-center gap-2">
                            <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-500 w-4"/> OPD Fee
                          </span>
                          <span className="font-bold text-gray-900">₹{hospital.opdFees}</span>
                      </li>
                  )}
                  {hospital.numberOfBeds && (
                      <li className="flex items-center justify-between">
                          <span className="text-gray-500 text-sm flex items-center gap-2">
                            <FontAwesomeIcon icon={faBed} className="text-blue-400 w-4"/> Beds
                          </span>
                          <span className="font-bold text-gray-900">{hospital.numberOfBeds}</span>
                      </li>
                  )}
                  {hospital.experience && (
                      <li className="flex items-center justify-between">
                          <span className="text-gray-500 text-sm flex items-center gap-2">
                            <FontAwesomeIcon icon={faAward} className="text-yellow-500 w-4"/> Experience
                          </span>
                          <span className="font-bold text-gray-900">{hospital.experience}</span>
                      </li>
                  )}
                  
                  {hospital.paymentMode && (
                      <li className="pt-2 border-t border-gray-50">
                          <span className="text-gray-500 text-sm flex items-center gap-2 mb-2">
                            <FontAwesomeIcon icon={faCreditCard} className="text-purple-500 w-4"/> Payment Modes
                          </span>
                          <div className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-100 p-3 rounded-xl">
                            {hospital.paymentMode}
                          </div>
                      </li>
                  )}
                  {hospital.insuranceAccepted && (
                      <li className="pt-2">
                          <span className="text-gray-500 text-sm flex items-center gap-2 mb-2">
                            <FontAwesomeIcon icon={faShieldAlt} className="text-red-500 w-4"/> Insurance
                          </span>
                          <div className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-100 p-3 rounded-xl">
                            {hospital.insuranceAccepted}
                          </div>
                      </li>
                  )}
              </ul>

              <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                  {hospital.website && (
                      <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                            <FontAwesomeIcon icon={faGlobe} />
                          </div>
                          Visit Website
                      </a>
                  )}
                  {hospital.email && (
                      <a href={`mailto:${hospital.email}`} className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                            <FontAwesomeIcon icon={faEnvelope} />
                          </div>
                          {hospital.email}
                      </a>
                  )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Doctors Section */}
        <div className="mb-10">
          <OurDoctors hospitalId={hospitalId} />
        </div>

      </div>

      {/* RESTORED FOOTER AT THE VERY BOTTOM */}
      <Footer />

      {/* --- AI REGISTRATION MODAL --- */}
      {showAiModal && (
        <div className="fixed inset-0 z-[100] bg-blue-900/40 backdrop-blur-sm flex justify-center items-center p-4 transition-opacity duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative animate-[scaleIn_0.2s_ease-out]">
                
                <button 
                    onClick={() => { setShowAiModal(false); setAiStatus("idle"); }} 
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <FontAwesomeIcon icon={faRobot} className="text-blue-600 text-2xl" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Pre-Book AI Call</h3>
                    <p className="text-gray-500 text-sm mt-1">Register your details, then call to choose your slot.</p>
                </div>

                {aiStatus === "success" ? (
                    <div className="text-center">
                        <div className="bg-green-50 border border-green-100 text-green-700 p-5 rounded-2xl mb-6">
                            <strong className="block mb-1 text-lg">Access Granted!</strong>
                            Our AI Agent now recognizes you.
                        </div>
                        <a href={`tel:${AI_AGENT_NUMBER}`} className="flex items-center justify-center w-full bg-green-500 text-white py-3.5 rounded-xl font-bold hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-0.5">
                            <FontAwesomeIcon icon={faPhoneAlt} className="mr-2" /> Call Agent Now
                        </a>
                    </div>
                ) : (
                    <form onSubmit={handleAiRegister} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Full Name</label>
                            <input 
                                type="text" required
                                className={inputClass}
                                placeholder="Enter your name"
                                value={aiForm.fullName}
                                onChange={(e) => setAiForm({...aiForm, fullName: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Phone (Calling From)</label>
                            <input 
                                type="tel" required
                                className={inputClass}
                                placeholder="e.g. 9876543210"
                                value={aiForm.contactNumber}
                                onChange={(e) => setAiForm({...aiForm, contactNumber: e.target.value})}
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Age</label>
                                <input 
                                    type="number" required
                                    className={inputClass}
                                    placeholder="Age"
                                    value={aiForm.age}
                                    onChange={(e) => setAiForm({...aiForm, age: e.target.value})}
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Gender</label>
                                <select 
                                    className={inputClass}
                                    value={aiForm.gender}
                                    onChange={(e) => setAiForm({...aiForm, gender: e.target.value})}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                          <button 
                              type="submit" 
                              disabled={aiStatus === "loading"}
                              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all flex justify-center items-center shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
                          >
                              {aiStatus === "loading" ? (
                                <span className="flex items-center gap-2">
                                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                  Registering...
                                </span>
                              ) : "Grant Call Access"}
                          </button>
                        </div>
                        
                        {aiStatus === "error" && (
                          <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">
                            Registration failed. Please try again.
                          </p>
                        )}
                    </form>
                )}
            </div>
        </div>
      )}

      {/* Animation Keyframes */}
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default HospitalDetails;