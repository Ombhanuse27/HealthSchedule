import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faPhoneAlt, 
  faClock, 
  faStar, 
  faStarHalfAlt,
  faStethoscope 
} from '@fortawesome/free-solid-svg-icons';

const HospitalCard = ({ 
  hospital_img, 
  hospital_name, 
  hospital_location, 
  hospital_phone_number, 
  hospital_speciality, 
  hospital_timing,
  id 
}) => {
 
  // 🔒 Validation (Untouched)
  if (!hospital_img || !hospital_name || !hospital_location || !hospital_phone_number || !hospital_speciality || !id) {
    return null;
  }

  return (
    // The 'group' class allows us to trigger animations on inner elements when hovering the card
    <Link to={`/hospital/${id}`} className="block h-full group outline-none">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transform hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
        
        {/* Image Section */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <img 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
            src={hospital_img} 
            alt={hospital_name} 
            loading="lazy"
          />
          
          {/* Frosted Glass Speciality Badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-blue-700 font-bold px-3 py-1.5 rounded-full text-[10px] tracking-wide uppercase shadow-sm flex items-center gap-1.5">
            <FontAwesomeIcon icon={faStethoscope} className="text-blue-500" /> 
            <span>{hospital_speciality}</span>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Title */}
          <h3 className="text-lg font-extrabold text-gray-900 mb-4 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {hospital_name}
          </h3>

          {/* Clean Vertical List Layout */}
          <div className="flex flex-col gap-2.5 mb-6">
            
            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-blue-500/80 w-4 flex justify-center">
                 <FontAwesomeIcon icon={faMapMarkerAlt} /> 
              </div>
              <span className="text-sm text-gray-600 leading-snug line-clamp-2">
                {hospital_location}
              </span>
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-3">
              <div className="text-blue-500/80 w-4 flex justify-center">
                <FontAwesomeIcon icon={faPhoneAlt} /> 
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {hospital_phone_number}
              </span>
            </div>

            {/* Timing */}
            <div className="flex items-center gap-3">
              <div className="text-blue-500/80 w-4 flex justify-center">
                <FontAwesomeIcon icon={faClock} /> 
              </div>
              <span className="text-sm text-gray-600">
                {hospital_timing || "9:00 AM - 5:00 PM"}
              </span>
            </div>

          </div>

          {/* Footer (Pushed to bottom via mt-auto) */}
          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            
            {/* Hardcoded Rating */}
            <div className="flex items-center gap-1.5">
              <div className="text-yellow-400 text-[11px] flex gap-0.5">
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStarHalfAlt} />
              </div>
              <span className="text-xs font-bold text-gray-700">4.5</span>
            </div>

            {/* View Details Link */}
            <div className="text-sm font-bold text-blue-600 flex items-center gap-1 group-hover:text-blue-700">
              View Details
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            
          </div>

        </div>
      </div>
    </Link>
  );
}

export default HospitalCard;