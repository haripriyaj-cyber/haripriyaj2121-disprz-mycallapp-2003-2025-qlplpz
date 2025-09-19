import React, { useState, useEffect, useCallback } from 'react';
import TimeSlotGrid from './TimeSlotGrid';
import LeftPanel from './LeftPanel';
import '../styles/CalendarView.css';

function CalendarView() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  // Fetch appointments when date changes
  useEffect(() => {
    fetchAppointments();
    // Clear selected appointment when date changes
    setSelectedAppointmentId(null);
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/appointments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      
      // Validate appointment data to prevent rendering issues
      const validAppointments = data.filter(appointment => {
        try {
          // Ensure startTime and endTime are valid dates
          new Date(appointment.startTime).toISOString();
          new Date(appointment.endTime).toISOString();
          return true;
        } catch (error) {
          console.error("Invalid appointment data:", appointment, error);
          return false;
        }
      });
      
      setAppointments(validAppointments);
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Memoize these functions to prevent unnecessary re-renders
  const formatDateTime = useCallback((dateTimeStr) => {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error("Error formatting date time:", dateTimeStr, error);
      return "Invalid time";
    }
  }, []);

  const formatDate = useCallback((date) => {
    try {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", date, error);
      return "Invalid date";
    }
  }, []);

  const navigateDay = useCallback((days) => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + days);
      return newDate;
    });
    // No need to clear selectedAppointmentId here as it will be handled by the useEffect
  }, []);

  const handleDateChange = useCallback((e) => {
    try {
      setSelectedDate(new Date(e.target.value));
      // No need to clear selectedAppointmentId here as it will be handled by the useEffect
    } catch (error) {
      console.error("Error changing date:", e.target.value, error);
    }
  }, []);

  const handleAppointmentSelect = useCallback((appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    
    // Find the appointment to scroll to its time slot
    const selectedAppointment = appointments.find(app => app.id === appointmentId);
    if (selectedAppointment) {
      try {
        // Ensure the date is set to the appointment date
        const appointmentDate = new Date(selectedAppointment.startTime);
        if (appointmentDate.toDateString() !== selectedDate.toDateString()) {
          setSelectedDate(appointmentDate);
        }
      } catch (error) {
        console.error("Error selecting appointment:", selectedAppointment, error);
      }
    }
  }, [appointments, selectedDate]);

  const handleUpcomingClick = useCallback((appointmentId, e) => {
    e.stopPropagation();
    console.log(`Upcoming button clicked for appointment ${appointmentId}`);
  }, []);

  const handleAppointmentDeleted = useCallback((deletedId) => {
    // Update the state to remove the deleted appointment
    setAppointments(prevAppointments => 
      prevAppointments.filter(appointment => appointment.id !== deletedId)
    );
    
    // Clear selection if the deleted appointment was selected
    if (selectedAppointmentId === deletedId) {
      setSelectedAppointmentId(null);
    }
  }, [selectedAppointmentId]);

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
