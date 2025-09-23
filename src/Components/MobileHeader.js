import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import '../styles/MobileHeader.css';

function MobileHeader({
  title,
  onNavigatePrevious,
  onNavigateNext,
  navigationType = 'day'
}) {
  const navigate = useNavigate();

  const navigateToNewAppointment = () => {
    navigate('/create');
  };

  return (
    <div className="mobile-header">
      <div className="mobile-title">
        <h2>{title}</h2>
      </div>
      
      <div className="mobile-controls">
        <div className={`mobile-${navigationType}-navigation`}>
          <button 
            className="mobile-nav-btn" 
            onClick={onNavigatePrevious}
            aria-label="Previous"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          
          <button 
            className="mobile-nav-btn" 
            onClick={onNavigateNext}
            aria-label="Next"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        
        <button 
          onClick={navigateToNewAppointment}
          className="mobile-add-btn"
          aria-label="Add new appointment"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
    </div>
  );
}

export default MobileHeader;