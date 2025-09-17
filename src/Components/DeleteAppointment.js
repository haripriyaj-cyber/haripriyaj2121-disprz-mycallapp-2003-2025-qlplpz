import React, { useState } from 'react';
import './DeleteAppointment.css';

function DeleteAppointment({ appointmentId, onAppointmentDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
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
      } catch (error) {
        setError(error.message);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <>
      <button 
        className="delete-btn" 
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
      {error && <div className="error-message">{error}</div>}
    </>
  );
}

export default DeleteAppointment;
