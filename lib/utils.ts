/**
 * Formats a number with proper separators and decimal points
 * @param value The number to format
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted number as string
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (value === undefined || value === null) {
    return '0';
  }

  // Handle very small numbers (less than 0.01)
  if (value > 0 && value < 0.01) {
    return '< 0.01';
  }

  // Format with proper comma separators and decimal places
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Truncates a string (like an address) to a specified length
 * @param str The string to truncate
 * @param startChars Characters to keep at the start
 * @param endChars Characters to keep at the end
 * @returns Truncated string with ellipsis in the middle
 */
export function truncateString(str: string, startChars: number = 4, endChars: number = 4): string {
  if (!str) return '';
  if (str.length <= startChars + endChars) return str;
  
  return `${str.substring(0, startChars)}...${str.substring(str.length - endChars)}`;
}

// Helper function to ensure images have proper URLs
export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return 'http://localhost:5000/uploads/placeholder.jpg';
  
  // If it's already an absolute URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a relative URL starting with /uploads, make it absolute
  if (imagePath.startsWith('/uploads')) {
    return `http://localhost:5000${imagePath}`;
  }
  
  // If it's something else, return as is
  return imagePath;
}; 