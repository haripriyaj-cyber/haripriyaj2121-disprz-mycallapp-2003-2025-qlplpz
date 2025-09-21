import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDateForInput } from '../utils/dateUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import '../styles/MonthView.css';

function MonthView({ 
  selectedDate, 
  appointments, 
  selectedAppointmentId, 
  onAppointmentSelect, 
  onDateSelect,
  hideHeader = false 
}) {
  const [calendarDays, setCalendarDays] = useState([]);
  const navigate = useNavigate();

  // Calculate the days to display in the month view
  useEffect(() => {
    const days = [];
    const date = new Date(selectedDate);
    
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
  }, [selectedDate]);

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

  // Get appointments for a specific day
  const getAppointmentsForDay = (date) => {
    return appointments.filter(appointment => {
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
  const handleAppointmentClick = (e, appointmentId) => {
    e.stopPropagation();
    onAppointmentSelect(appointmentId);
  };

  // Create a new appointment on a specific day
  const createAppointmentOnDay = (date, e) => {
    e.stopPropagation();
    const formattedDate = formatDateForInput(date.toISOString());
    navigate(`/create?startTime=${encodeURIComponent(formattedDate)}`);
  };

  return (
    <div className="month-view">
      <div className="weekday-headers">
        <div className="weekday-header">Sun</div>
        <div className="weekday-header">Mon</div>
        <div className="weekday-header">Tue</div>
        <div className="weekday-header">Wed</div>
        <div className="weekday-header">Thu</div>
        <div className="weekday-header">Fri</div>
        <div className="weekday-header">Sat</div>
      </div>
      
      <div className="month-days">
        {calendarDays.map((day, index) => (
          <div 
            key={index} 
            className={`month-day 
              ${day.isCurrentMonth ? 'current-month' : 'other-month'} 
              ${isToday(day.date) ? 'today' : ''} 
              ${isSelectedDate(day.date) ? 'selected' : ''}`}
            onClick={() => handleDayClick(day.date)}
          >
            <div className="day-number">{formatDayNumber(day.date)}</div>
            
            <div className="day-appointments">
              {getAppointmentsForDay(day.date).slice(0, 2).map(appointment => (
                <div 
                  key={appointment.id}
                  className={`month-appointment ${appointment.id === selectedAppointmentId ? 'selected' : ''}`}
                  onClick={(e) => handleAppointmentClick(e, appointment.id)}
                >
                  <div className="appointment-title">{appointment.title}</div>
                </div>
              ))}
              
              {getAppointmentsForDay(day.date).length > 2 && (
                <div className="more-appointments">
                  +{getAppointmentsForDay(day.date).length - 2} more
                </div>
              )}
              
              {day.isCurrentMonth && (
                <button 
                  className="add-appointment-btn"
                  onClick={(e) => createAppointmentOnDay(day.date, e)}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MonthView;