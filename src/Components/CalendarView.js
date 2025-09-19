import React, { useState, useEffect } from 'react';
import TimeSlotGrid from './TimeSlotGrid';
import LeftPanel from './LeftPanel';
import '../styles/CalendarView.css'; // Keep this import for the container styles

function CalendarView() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add state for selected appointment
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/appointments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      setAppointments(data);
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const navigateDay = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  // Add a handler for appointment selection
  const handleAppointmentSelect = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    
    // Find the appointment to scroll to its time slot
    const selectedAppointment = appointments.find(app => app.id === appointmentId);
    if (selectedAppointment) {
      // Ensure the date is set to the appointment date
      const appointmentDate = new Date(selectedAppointment.startTime);
      if (appointmentDate.toDateString() !== selectedDate.toDateString()) {
        setSelectedDate(appointmentDate);
      }
    }
  };

  const handleUpcomingClick = (appointmentId, e) => {
    e.stopPropagation();
    console.log(`Upcoming button clicked for appointment ${appointmentId}`);
  };

  const handleAppointmentDeleted = (deletedId) => {
    // Update the state to remove the deleted appointment
    setAppointments(appointments.filter(appointment => appointment.id !== deletedId));
    // Clear selection if the deleted appointment was selected
    if (selectedAppointmentId === deletedId) {
      setSelectedAppointmentId(null);
    }
  };

  return (
    <div className="scheduler-container">
      <LeftPanel 
        appointments={appointments}
        selectedDate={selectedDate}
        isLoading={isLoading}
        error={error}
        navigateDay={navigateDay}
        handleDateChange={handleDateChange}
        handleUpcomingClick={handleUpcomingClick}
        handleAppointmentDeleted={handleAppointmentDeleted}
        formatDateTime={formatDateTime}
        formatDate={formatDate}
        selectedAppointmentId={selectedAppointmentId}
        onAppointmentSelect={handleAppointmentSelect}
      />
      
      <div className="scheduler-main-content">
        <TimeSlotGrid 
          selectedDate={selectedDate} 
          appointments={appointments}
          selectedAppointmentId={selectedAppointmentId}
          onAppointmentSelect={handleAppointmentSelect}
        />
      </div>
    </div>
  );
}

export default CalendarView;
