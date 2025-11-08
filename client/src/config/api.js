// API Configuration
// This handles API URLs for both development and production

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to build API URLs
export const getApiUrl = (endpoint) => {
  // Always use full URL from environment variable
  // This ensures production deployment works correctly
  return `${API_BASE_URL}${endpoint}`;
};

export default API_BASE_URL;
