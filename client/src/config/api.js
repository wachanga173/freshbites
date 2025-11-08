// API Configuration
// This handles API URLs for both development and production

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to build API URLs
export const getApiUrl = (endpoint) => {
  // In development, use proxy (relative paths)
  if (import.meta.env.DEV) {
    return endpoint;
  }
  
  // In production, use full URL from environment variable
  return `${API_BASE_URL}${endpoint}`;
};

export default API_BASE_URL;
