import React, { useEffect, useState } from "react";

import HospitalCard from "./HospitalCard.js";
import doctorone from "../../images/doctor-6.jpg";
import "./Hospital.css";
import Footer from "../Footer/Footer.js";
import { getHospitalsData } from "../../api/hospitalApi.js";

const Hospital = () => {
  const [HospitalList, setHospitalList] = useState([]); // Master list of all hospitals
  const [filteredHospitals, setFilteredHospitals] = useState([]); // List to be displayed
  const [cities, setCities] = useState([]); // Unique list of cities for dropdown
  const [selectedCity, setSelectedCity] = useState(""); // Currently selected city
  const [searchTerm, setSearchTerm] = useState(""); // State for search input

  // 1. Fetch data and populate lists
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await getHospitalsData(); // Fetch hospitals from API

        

        const formattedHospitals = data.map((hospital) => {

          const start = hospital.hospitalStartTime || "9:00 AM";
          const end = hospital.hospitalEndTime || "5:00 PM";
        return{
          id: hospital._id,
          hospital_img: hospital.hospitalImage || doctorone,
          hospital_name: hospital.hospitalName,
          hospital_location: hospital.address,
          hospital_city: hospital.city, // <-- ADDED CITY
          hospital_phone_number: hospital.contactNumber,
          hospital_speciality: hospital.Specialist,
          hospital_timing: `${start} - ${end}`,
          };
        });

        // Get unique, sorted list of cities, filtering out any empty values
        const uniqueCities = [
          ...new Set(formattedHospitals.map((h) => h.hospital_city).filter(Boolean)),
        ].sort();

        setCities(uniqueCities);
        setHospitalList(formattedHospitals); // Set the master list
        setFilteredHospitals(formattedHospitals); // Set the initial displayed list
      } catch (error) {
        console.error("Error fetching hospital data:", error);
      }
    };

    fetchHospitals();
  }, []);

  // 2. Filter logic effect
  useEffect(() => {
    let result = HospitalList;

    // Filter by city
    if (selectedCity) {
      result = result.filter(
        (hospital) => hospital.hospital_city === selectedCity
      );
    }

    // Filter by search term (checks name and specialty)
    if (searchTerm) {
      result = result.filter(
        (hospital) =>
          hospital.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hospital.hospital_speciality?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredHospitals(result);
  }, [selectedCity, searchTerm, HospitalList]); // Re-run when filters or master list change

  return (
    <div className="hospital-list-container">
    
      <div className="search-container">
        {/* Search Input */}
        <div className="search">
          <input
            type="text"
            placeholder="Search by hospital name or specialty..."
            id="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <img
            id="search-icon"
            src="https://img.icons8.com/ios/452/search--v1.png"
            alt="search"
          />
        </div>

        {/* City Filter Dropdown */}
        <div className="city-filter">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="city-dropdown"
          >
            <option value="">All Cities</option>
            {cities.map((city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="hospital-list">
        {filteredHospitals.length > 0 ? (
          filteredHospitals.map((hospital, index) => (
            <HospitalCard key={index} id={hospital.id} {...hospital} />
          ))
        ) : (
          <p className="no-results">No hospitals found matching your criteria.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Hospital;