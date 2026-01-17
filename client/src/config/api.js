// API Configuration
// This handles API URLs for both development and production

// In development, use relative URLs to leverage Vite's proxy
// In production, use the environment variable or default to production server
const isDevelopment = import.meta.env.DEV
const API_BASE_URL = isDevelopment 
  ? '' // Empty string means relative URLs, which Vite will proxy to localhost:3000
  : (import.meta.env.VITE_API_URL || 'https://cafeteria-ftwf.onrender.com')

// Helper function to build API URLs
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`
}

export default API_BASE_URL
