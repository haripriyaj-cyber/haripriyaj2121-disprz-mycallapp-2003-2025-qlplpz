import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faMapMarkerAlt, 
  faAlignLeft, 
  faEdit, 
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import { formatDateTimeForDisplay } from '../utils/dateUtils';
import DeleteAppointment from './DeleteAppointment';
import '../styles/AppointmentDetailsModal.css';

function AppointmentDetailsModal({ 
  appointment, 
  onClose, 
  onAppointmentDeleted,
  isMobile = false
}) {
  if (!appointment) return null;
  
  // Check if appointment is in the past
  const isAppointmentInPast = () => {
    const endTime = new Date(appointment.endTime);
    return endTime < new Date();
  };
  
  const isPastAppointment = isAppointmentInPast();
  
  const handleAppointmentDeleted = (deletedId) => {
    // Call the parent's onAppointmentDeleted function
    if (onAppointmentDeleted) {
      onAppointmentDeleted(deletedId);
    }
    // Close the modal
    onClose();
  };
  
  return (
    <div className={`appointment-details-overlay ${isMobile ? 'mobile' : ''}`}>
      <div className={`appointment-details-modal ${isMobile ? 'mobile' : ''}`}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>{appointment.title}</h3>
        <p className="detail-time">
          <strong><FontAwesomeIcon icon={faClock} /> Start:</strong> {formatDateTimeForDisplay(appointment.startTime)}
        </p>
        <p className="detail-time">
          <strong><FontAwesomeIcon icon={faClock} /> End:</strong> {formatDateTimeForDisplay(appointment.endTime)}
        </p>
        {appointment.location && appointment.location.trim() !== "" && (
          <p className="detail-location">
            <strong><FontAwesomeIcon icon={faMapMarkerAlt} /> Location:</strong> {appointment.location}
          </p>
        )}
        {appointment.description && appointment.description.trim() !== "" && (
          <div className="detail-description">
            <strong><FontAwesomeIcon icon={faAlignLeft} /> Description:</strong>
            <p>{appointment.description}</p>
          </div>
        )}
        <div className="detail-actions">
          {!isPastAppointment && (
            <Link 
              to={`/update-appointment/${appointment.id}`} 
              className="edit-btn"
            >
              <FontAwesomeIcon icon={faEdit} /> Edit
            </Link>
          )}
          {isPastAppointment && (
            <span className="edit-btn disabled">
              <FontAwesomeIcon icon={faEdit} /> Edit
            </span>
          )}
          <div className="delete-btn-container">
            {!isPastAppointment ? (
              <DeleteAppointment 
                appointmentId={appointment.id} 
                onAppointmentDeleted={handleAppointmentDeleted}
                useIcon={true}
                icon={faTrashAlt}
              />
            ) : (
              <button 
                className="delete-icon-btn disabled" 
                disabled={true}
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentDetailsModal;