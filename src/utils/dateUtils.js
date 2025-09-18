/**
 * Date utility functions for consistent date/time handling across the application
 */

/**
 * Formats a date for display in the UI with proper time zone handling
 * @param {string} dateTimeStr - ISO date string
 * @returns {string} Formatted date string for display
 */
export const formatDateTimeForDisplay = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  
  // Parse the ISO string into a Date object
  const date = new Date(dateTimeStr);
  
  // Format the date using toLocaleString for better readability and correct time zone handling
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Formats a date from a form input for sending to the backend
 * Ensures proper time zone information is included
 * @param {string} dateString - Date string from form input
 * @returns {string} ISO date string with time zone information
 */
export const formatDateForBackend = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toISOString();
};

/**
 * Formats a date from the backend for use in datetime-local input fields
 * @param {string} dateString - ISO date string from backend
 * @returns {string} Formatted date string for datetime-local input (YYYY-MM-DDTHH:MM)
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  // Create a date object from the ISO string
  const date = new Date(dateString);
  
  // Format to YYYY-MM-DDTHH:MM (format required by datetime-local input)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Gets the user's current time zone
 * @returns {string} User's time zone name
 */
export const getUserTimeZone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Validates that end time is after start time
 * @param {string} startTime - Start time string
 * @param {string} endTime - End time string
 * @returns {string|null} Error message or null if valid
 */
export const validateTimeRange = (startTime, endTime) => {
  if (startTime && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (end <= start) {
      return "End time must be after start time";
    }
  }
  return null;
};
