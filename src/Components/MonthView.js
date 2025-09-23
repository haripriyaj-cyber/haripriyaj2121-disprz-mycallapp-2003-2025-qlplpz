import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDateTimeForDisplay, formatDateForInput } from '../utils/dateUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus,
  faClock, 
  faMapMarkerAlt, 
  faAlignLeft, 
  faEdit, 
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import DeleteAppointment from './DeleteAppointment';
import CalendarHeader from './CalendarHeader';
import '../styles/MonthView.css';

function MonthView({ 
  selectedDate, 
  appointments, 
  selectedAppointmentId, 
  onAppointmentSelect,
  viewMode,
  onViewModeChange,
  onDateSelect,
  darkMode,
  onDarkModeToggle
}) {
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  const [localAppointments, setLocalAppointments] = useState(appointments);
  const navigate = useNavigate();

  // Update local appointments when props change
  useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);

  // Update current month when selected date changes
  useEffect(() => {
    setCurrentMonth(new Date(selectedDate));
  }, [selectedDate]);

  // Calculate the days to display in the month view
  useEffect(() => {
    const days = [];
    const date = new Date(currentMonth);
    
    // Set to first day of the month
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Get the last day of the month
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;
    const prevMonth = new Date(firstDayOfMonth);
    prevMonth.setDate(0); // Last day of previous month
    
    // Add days from previous month
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const prevMonthDay = new Date(prevMonth);
      prevMonthDay.setDate(prevMonth.getDate() - i);
      days.push({
        date: prevMonthDay,
        isCurrentMonth: false
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const currentMonthDay = new Date(date.getFullYear(), date.getMonth(), i);
      days.push({
        date: currentMonthDay,
        isCurrentMonth: true
      });
    }
    
    // Calculate how many days we need from next month to complete the grid
    const totalDaysToShow = 42; // 6 rows of 7 days
    const daysFromNextMonth = totalDaysToShow - days.length;
    
    // Add days from next month
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const nextMonthDay = new Date(date.getFullYear(), date.getMonth() + 1, i);
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false
      });
    }
    
    setCalendarDays(days);
  }, [currentMonth]);

  // Format date for display
  const formatDayNumber = (date) => {
    return date.getDate();
  };

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if a date is the selected date
  const isSelectedDate = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  // Check if a date is in the past
  const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Get appointments for a specific day
  const getAppointmentsForDay = (date) => {
    return localAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.startTime);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  // Handle click on a day
  const handleDayClick = (date) => {
    // Set the selected date to the clicked day
    const newDate = new Date(date);
    onDateSelect(newDate);
  };

  // Handle click on an appointment
  const handleAppointmentClick = (e, appointment) => {
    e.stopPropagation();
    setShowDetails(true);
    setSelectedAppointment(appointment);
    onAppointmentSelect(appointment.id);
  };

  // Create a new appointment on a specific day
  const createAppointmentOnDay = (date, e) => {
    e.stopPropagation();
    
    // Don't allow creating appointments in the past
    if (isDateInPast(date)) {
      return;
    }
    
    const formattedDate = formatDateForInput(date.toISOString());
    navigate(`/create?startTime=${encodeURIComponent(formattedDate)}`);
  };

  // Navigate to previous month
  const navigateToPreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
    
    // Also update the selected date to the 1st of the new month
    const newSelectedDate = new Date(prevMonth);
    newSelectedDate.setDate(1);
    onDateSelect(newSelectedDate);
  };

  // Navigate to next month
  const navigateToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
    
    // Also update the selected date to the 1st of the new month
    const newSelectedDate = new Date(nextMonth);
    newSelectedDate.setDate(1);
    onDateSelect(newSelectedDate);
  };

  // Format the month and year for display
  const formatMonthYear = () => {
    return currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Handle click on "New Appointment" button
  const navigateToNewAppointment = () => {
    navigate('/create');
  };

  // Close appointment details modal
  const closeAppointmentDetails = () => {
    setSelectedAppointment(null);
    setShowDetails(true);
  };

  // Handle appointment deletion
  const handleAppointmentDeleted = (deletedId) => {
    // Update local state immediately to remove the appointment
    setLocalAppointments(prevAppointments => 
      prevAppointments.filter(app => app.id !== deletedId)
    );
    
    // If the deleted appointment was selected, clear the selection
    if (selectedAppointmentId === deletedId) {
      onAppointmentSelect(null);
    }
    
    // Close the modal
    setSelectedAppointment(null);
    
    // Create a custom event to notify other components about the deletion
    const customEvent = new CustomEvent('appointmentDeleted', {
      detail: { appointmentId: deletedId }
    });
    document.dispatchEvent(customEvent);
  };

  // Determine appointment status
  const getAppointmentStatus = (appointment) => {
    const now = new Date();
    const startTime = new Date(appointment.startTime);
    const endTime = new Date(appointment.endTime);
    
    if (endTime < now) {
      return "attended";
    } else if (startTime < now && endTime > now) {
      return "recent";
    } else {
      return "upcoming";
    }
  };

  // Appointment Details Modal Component
  function AppointmentDetailsModal({ appointment, onClose, onAppointmentDeleted }) {
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
      <div className="appointment-details-overlay">
        <div className="appointment-details-modal">
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

  return (
    <div className={`month-view-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header similar to WeeklyView */}
      <CalendarHeader
        title={formatMonthYear()}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onNavigatePrevious={navigateToPreviousMonth}
        onNavigateNext={navigateToNextMonth}
        navigationType="month"
        darkMode={darkMode}
        onDarkModeToggle={onDarkModeToggle}
      />
      
      {/* Weekday headers */}
      <div className="weekday-headers">
        <div className="weekday-header">Sun</div>
        <div className="weekday-header">Mon</div>
        <div className="weekday-header">Tue</div>
        <div className="weekday-header">Wed</div>
        <div className="weekday-header">Thu</div>
        <div className="weekday-header">Fri</div>
        <div className="weekday-header">Sat</div>
      </div>
      
      {/* Calendar grid */}
      <div className="month-days">
        {calendarDays.map((day, index) => {
          const dayAppointments = getAppointmentsForDay(day.date);
          const isPastDay = isDateInPast(day.date);
          
          // Calculate how many appointments to show based on available space
          // For smaller screens or days with many appointments, show fewer
          const maxAppointmentsToShow = 2; // Reduced from 3 to 2
          
          return (
            <div 
              key={index} 
              className={`month-day 
                ${day.isCurrentMonth ? 'current-month' : 'other-month'} 
                ${isToday(day.date) ? 'today' : ''} 
                ${isSelectedDate(day.date) ? 'selected' : ''}
                ${isPastDay ? 'past-day' : ''}`}
              onClick={() => handleDayClick(day.date)}
            >
              <div className="day-number">{formatDayNumber(day.date)}</div>
              
              <div className="day-appointments">
                {dayAppointments.slice(0, maxAppointmentsToShow).map(appointment => {
                  const status = getAppointmentStatus(appointment);
                  
                  return (
                    <div 
                      key={appointment.id}
                      className={`month-appointment status-${status} ${appointment.id === selectedAppointmentId ? 'selected' : ''}`}
                      onClick={(e) => handleAppointmentClick(e, appointment)}
                      title={appointment.title} // Use title attribute to show full text on hover
                    >
                      <div className="appointment-title">{appointment.title}</div>
                    </div>
                  );
                })}
                
                {dayAppointments.length > maxAppointmentsToShow && (
                  <div 
                    className="more-appointments"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDayClick(day.date);
                    }}
                    title={`${dayAppointments.length - maxAppointmentsToShow} more appointments`} // Add title for hover tooltip
                  >
                    +{dayAppointments.length - maxAppointmentsToShow} more
                  </div>
                )}
                
                {day.isCurrentMonth && !isPastDay && (
                  <button 
                    className="add-appointment-btn"
                    onClick={(e) => createAppointmentOnDay(day.date, e)}
                    title="Add new appointment" // Add title for hover tooltip
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Appointment Details Modal */}
      {selectedAppointment && showDetails && (
        <AppointmentDetailsModal 
          appointment={selectedAppointment} 
          onClose={closeAppointmentDetails}
          onAppointmentDeleted={handleAppointmentDeleted}
        />
      )}
    </div>
  );
}

export default MonthView;