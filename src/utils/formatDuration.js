/**
 * Converts ISO 8601 duration strings to human-readable format
 * Supports full ISO 8601 duration syntax: P[n]Y[n]M[n]DT[n]H[n]M[n]S
 * 
 * @param {string} duration - The ISO 8601 duration string (e.g., "PT1H23M30S", "P3Y6M4DT12H30M5S")
 * @returns {string|null} Human-readable duration string or null for empty/zero durations
 * 
 * @example
 * formatDuration("PT1H23M30S") // "1 Hour 23 Minutes 30 Seconds"
 * formatDuration("P3Y6M4DT12H30M5S") // "3 Years 6 Months 4 Days 12 Hours 30 Minutes 5 Seconds"
 * formatDuration("PT45M") // "45 Minutes"
 * formatDuration("P1Y2M") // "1 Year 2 Months"
 */
export const formatDuration = (duration) => {
  if (!duration || duration === 'PT0S' || duration === 'P0D') {
    return null;
  }

  // Check if it's a valid ISO 8601 duration (starts with P)
  if (!duration.startsWith('P')) {
    return duration;
  }

  try {
    let years = 0;
    let months = 0;
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    // Remove the 'P' prefix
    let durationString = duration.substring(1);

    // Check if there's a time component (contains 'T')
    let timePart = '';
    let datePart = durationString;

    if (durationString.includes('T')) {
      const parts = durationString.split('T');
      datePart = parts[0];
      timePart = parts[1];
    }

    // Parse date components (before T)
    if (datePart) {
      // Years
      const yearMatch = datePart.match(/(\d+(?:\.\d+)?)Y/);
      if (yearMatch) {
        years = parseFloat(yearMatch[1]);
        datePart = datePart.replace(/\d+(?:\.\d+)?Y/, '');
      }
      
      // Months (before T)
      const monthMatch = datePart.match(/(\d+(?:\.\d+)?)M/);
      if (monthMatch) {
        months = parseFloat(monthMatch[1]);
        datePart = datePart.replace(/\d+(?:\.\d+)?M/, '');
      }
      
      // Days
      const dayMatch = datePart.match(/(\d+(?:\.\d+)?)D/);
      if (dayMatch) {
        days = parseFloat(dayMatch[1]);
      }
    }

    // Parse time components (after T)
    if (timePart) {
      // Hours
      const hourMatch = timePart.match(/(\d+(?:\.\d+)?)H/);
      if (hourMatch) {
        hours = parseFloat(hourMatch[1]);
        timePart = timePart.replace(/\d+(?:\.\d+)?H/, '');
      }
      
      // Minutes (after T)
      const minuteMatch = timePart.match(/(\d+(?:\.\d+)?)M/);
      if (minuteMatch) {
        minutes = parseFloat(minuteMatch[1]);
        timePart = timePart.replace(/\d+(?:\.\d+)?M/, '');
      }
      
      // Seconds
      const secondMatch = timePart.match(/(\d+(?:\.\d+)?)S/);
      if (secondMatch) {
        seconds = parseFloat(secondMatch[1]);
      }
    }

    // Build human-readable string
    const parts = [];

    if (years > 0) {
      const yearText = years % 1 === 0 ? Math.floor(years) : years;
      parts.push(`${yearText} Year${years !== 1 ? 's' : ''}`);
    }
    if (months > 0) {
      const monthText = months % 1 === 0 ? Math.floor(months) : months;
      parts.push(`${monthText} Month${months !== 1 ? 's' : ''}`);
    }
    if (days > 0) {
      const dayText = days % 1 === 0 ? Math.floor(days) : days;
      parts.push(`${dayText} Day${days !== 1 ? 's' : ''}`);
    }
    if (hours > 0) {
      const hourText = hours % 1 === 0 ? Math.floor(hours) : hours;
      parts.push(`${hourText} Hour${hours !== 1 ? 's' : ''}`);
    }
    if (minutes > 0) {
      const minuteText = minutes % 1 === 0 ? Math.floor(minutes) : minutes;
      parts.push(`${minuteText} Minute${minutes !== 1 ? 's' : ''}`);
    }
    if (seconds > 0) {
      const secondText = seconds % 1 === 0 ? Math.floor(seconds) : seconds;
      parts.push(`${secondText} Second${seconds !== 1 ? 's' : ''}`);
    }

    if (parts.length === 0) {
      return '0 Seconds';
    }

    return parts.join(' ');
  } catch (error) {
    console.warn('Failed to parse duration:', duration, error);
    // If parsing fails, return the original value
    return duration;
  }
};

/**
 * Checks if a string appears to be an ISO 8601 duration
 * @param {string} value - The value to check
 * @returns {boolean} True if the value looks like an ISO 8601 duration
 */
export const isISO8601Duration = (value) => {
  if (typeof value !== 'string') return false;
  
  // Basic check for ISO 8601 duration format
  return /^P(?:\d+(?:\.\d+)?[YMWD])*(?:T(?:\d+(?:\.\d+)?[HMS])*)?$/.test(value);
};

export default formatDuration; 