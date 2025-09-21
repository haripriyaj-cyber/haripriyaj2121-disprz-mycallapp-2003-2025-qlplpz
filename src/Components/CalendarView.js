import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TimeSlotGrid from './TimeSlotGrid';
import WeeklyView from './WeeklyView';
import MonthView from './MonthView';
import LeftPanel from './LeftPanel';
import '../styles/CalendarView.css';

function CalendarView() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [viewMode, setViewMode] = useState('day');

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

  // Listen for appointment deletion events
  useEffect(() => {
    const handleAppointmentDeleted = (event) => {
      const { appointmentId } = event.detail;
      
      // Update the appointments list to remove the deleted appointment
      setAppointments(prevAppointments => 
        prevAppointments.filter(app => app.id !== appointmentId)
      );
      
      // Clear selection if the deleted appointment was selected
      if (selectedAppointmentId === appointmentId) {
        setSelectedAppointmentId(null);
      }
    };

    document.addEventListener('appointmentDeleted', handleAppointmentDeleted);
    
    return () => {
      document.removeEventListener('appointmentDeleted', handleAppointmentDeleted);
    };
  }, [selectedAppointmentId]);

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
    // Clear selected appointment when changing date
    setSelectedAppointmentId(null);
  }, []);

  // Add a function to navigate week
  const navigateWeek = useCallback((weeks) => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + (weeks * 7));
      return newDate;
    });
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

  // Make sure this function formats the date correctly
  const formatDateForUrl = (date) => {
    // Create a copy of the date to avoid modifying the original
    const dateCopy = new Date(date);
    
    // Format as YYYY-MM-DD (just the date part)
    const year = dateCopy.getFullYear();
    const month = String(dateCopy.getMonth() + 1).padStart(2, '0');
    const day = String(dateCopy.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const navigate = useNavigate();

  // Update the navigation function to use the formatted date
  const navigateToNewAppointment = () => {
    const formattedDate = formatDateForUrl(selectedDate);
    console.log("Selected date for new appointment:", formattedDate);
    navigate(`/appointment/new?startTime=${formattedDate}`);
  };

  // Handle view mode change
  const handleViewModeChange = (e) => {
    setViewMode(e.target.value);
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
        {viewMode === 'day' ? (
          <TimeSlotGrid 
            selectedDate={selectedDate} 
            appointments={appointments}
            selectedAppointmentId={selectedAppointmentId}
            onAppointmentSelect={handleAppointmentSelect}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            navigateDay={navigateDay}
          />
        ) : viewMode === 'week' ? (
          <WeeklyView 
            selectedDate={selectedDate} 
            appointments={appointments}
            selectedAppointmentId={selectedAppointmentId}
            onAppointmentSelect={handleAppointmentSelect}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            navigateWeek={navigateWeek}
          />
        ) : (
          <MonthView 
            selectedDate={selectedDate} 
            appointments={appointments}
            selectedAppointmentId={selectedAppointmentId}
            onAppointmentSelect={handleAppointmentSelect}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onDateSelect={setSelectedDate}
          />
        )}
      </div>
    </div>
  );
}

export default CalendarView;
