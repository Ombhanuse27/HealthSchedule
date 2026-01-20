import React from 'react';
import { Link } from 'react-router-dom';
import './HospitalCard.css';
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
 
  // 🔒 Validation
  if (!hospital_img || !hospital_name || !hospital_location || !hospital_phone_number || !hospital_speciality || !id) {
    return null;
  }

  return (
    <div className="hospital-container-item">
      <Link to={`/hospital/${id}`} className="hospital-card-link">
        <div className='hospital-card-box'>
          
          {/* Image Section */}
          <div className="card-image-wrapper">
            <img className='hospital-card-img' src={hospital_img} alt={hospital_name} />
            <div className="speciality-badge">
              <FontAwesomeIcon icon={faStethoscope} className="badge-icon" /> 
              <span className="badge-text">{hospital_speciality}</span>
            </div>
          </div>

          {/* Info Section */}
          <div className="hospital-info-content">
            <h3 className='hospital-name-title'>
              {hospital_name}
            </h3>

            {/* ✅ UPDATED: Clean Vertical List Layout */}
            <div className="info-body-list">
              <div className="info-row">
                <div className="icon-box loc-icon">
                   <FontAwesomeIcon icon={faMapMarkerAlt} /> 
                </div>
                <span className="info-text">{hospital_location}</span>
              </div>
              
              <div className="info-row">
                <div className="icon-box phone-icon">
                  <FontAwesomeIcon icon={faPhoneAlt} /> 
                </div>
                <span className="info-text">{hospital_phone_number}</span>
              </div>

              <div className="info-row">
                <div className="icon-box time-icon">
                  <FontAwesomeIcon icon={faClock} /> 
                </div>
                <span className="info-text">{hospital_timing || "9:00 AM - 5:00 PM"}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="card-footer-row">
              <div className="rating-badge">
                <span className="stars-icon">
                  <FontAwesomeIcon icon={faStar} />
                  <FontAwesomeIcon icon={faStar} />
                  <FontAwesomeIcon icon={faStar} />
                  <FontAwesomeIcon icon={faStar} />
                  <FontAwesomeIcon icon={faStarHalfAlt} />
                </span>
                <span className="rating-num">4.5</span>
              </div>
              <span className="view-btn-text">View Details</span>
            </div>

          </div>
        </div>
      </Link>
    </div>
  );
}

export default HospitalCard;