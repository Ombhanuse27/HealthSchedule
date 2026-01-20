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
  id 
}) => {
 
  // 🔒 VALIDATION: Only show card if ALL fields are present
  if (!hospital_img || !hospital_name || !hospital_location || !hospital_phone_number || !hospital_speciality || !id) {
    return null;
  }

  return (
    <div className="hospital-container1">
      <Link to={`/hospital/${id}`} className="hospital-card-link">
        <div className='hospital-card1'>
          
          {/* Image Section */}
          <div className="card-image-wrapper">
            <img id='hospital-card-img1' src={hospital_img} alt={hospital_name} />
            <span className="speciality-badge">
              <FontAwesomeIcon icon={faStethoscope} /> {hospital_speciality}
            </span>
          </div>

          {/* Info Section */}
          <div className="hospital-info1">
            <h3 id='hospital_name1'>
              {hospital_name}
            </h3>

            <div className="info-body">
              <p id='location1'>
                <FontAwesomeIcon icon={faMapMarkerAlt} className="card-icon loc-icon" /> 
                {hospital_location}
              </p>
              
              <p id='ph_number1'>
                <FontAwesomeIcon icon={faPhoneAlt} className="card-icon phone-icon" /> 
                {hospital_phone_number}
              </p>

              <p id='timing1'>
                <FontAwesomeIcon icon={faClock} className="card-icon time-icon" /> 
                9:00 AM - 5:00 PM
              </p>
            </div>

            <div className="card-footer">
              <div id='rating1' className="rating-box">
                <span className="stars">
                  <FontAwesomeIcon icon={faStar} />
                  <FontAwesomeIcon icon={faStar} />
                  <FontAwesomeIcon icon={faStar} />
                  <FontAwesomeIcon icon={faStar} />
                  <FontAwesomeIcon icon={faStarHalfAlt} />
                </span>
                <span className="rating-value">4.5</span>
              </div>
              <span className="view-btn">View Details</span>
            </div>

          </div>
        </div>
      </Link>
    </div>
  );
}

export default HospitalCard;