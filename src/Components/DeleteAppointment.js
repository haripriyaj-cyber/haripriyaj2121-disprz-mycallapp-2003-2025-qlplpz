import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import '../styles/DeleteAppointment.css';

function DeleteAppointment({ appointmentId, onAppointmentDeleted, useIcon = false, icon = faTrashAlt }) {
  // Remove the unused currentUser
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState(null);

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }
      
      // Notify parent component that deletion was successful
      onAppointmentDeleted(appointmentId);
      
      // Dispatch a custom event that other components can listen for
      const event = new CustomEvent('appointmentDeleted', { 
        detail: { appointmentId } 
      });
      document.dispatchEvent(event);
      
    } catch (error) {
      setError(error.message);
      setShowConfirmation(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="delete-appointment">
      {!showConfirmation ? (
        useIcon ? (
          <button 
            onClick={handleDeleteClick} 
            className="delete-icon-btn"
            disabled={isDeleting}
            title="Delete appointment"
          >
            <FontAwesomeIcon icon={icon} />
          </button>
        ) : (
          <button 
            onClick={handleDeleteClick} 
            className="delete-btn"
            disabled={isDeleting}
          >
            Delete
          </button>
        )
      ) : (
        <div className="delete-confirmation">
          <p>Are you sure you want to delete this appointment?</p>
          <div className="confirmation-actions">
            <button 
              onClick={handleCancelDelete} 
              className="cancel-delete-btn"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmDelete} 
              className="confirm-delete-btn"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      )}
      
      {error && <div className="delete-error">Error: {error}</div>}
    </div>
  );
}

export default DeleteAppointment;
