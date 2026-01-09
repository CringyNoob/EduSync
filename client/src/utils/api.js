import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edusync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;
      
      // Extract error message from various possible formats
      let errorMessage = 'An error occurred';
      
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data) {
        errorMessage = data.message || data.error || data.msg || errorMessage;
      }

      // Handle specific status codes
      switch (status) {
        case 400:
          // Bad request - show specific validation errors
          errorMessage = data.message || data.error || 'Invalid request. Please check your input.';
          break;

        case 401:
          // Unauthorized - Clear token and redirect to login
          errorMessage = data.message || data.error || 'Invalid credentials. Please try again.';
          localStorage.removeItem('edusync_token');
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
          break;

        case 403:
          // Forbidden - User doesn't have permission
          errorMessage = data.message || data.error || 'Access forbidden. You do not have permission.';
          break;

        case 404:
          // Not found
          errorMessage = data.message || data.error || 'Resource not found.';
          break;

        case 429:
          // Rate limit exceeded
          errorMessage = data.message || data.error || 'Too many requests. Please try again later.';
          break;

        case 500:
        case 502:
        case 503:
          // Server errors
          errorMessage = data.message || data.error || 'Server error. Please try again later.';
          break;

        default:
          // Use extracted message or fallback
          errorMessage = data.message || data.error || 'An error occurred. Please try again.';
      }

      console.error(`API Error [${status}]:`, errorMessage);

      // Return structured error
      return Promise.reject({
        status,
        message: errorMessage,
        errors: data.errors || [],
      });
    } else if (error.request) {
      // Request made but no response received
      const errorMessage = 'No response from server. Please check your connection.';
      console.error('Network Error:', errorMessage);
      return Promise.reject({
        message: errorMessage,
      });
    } else {
      // Something else happened
      const errorMessage = error.message || 'An unexpected error occurred';
      console.error('Request Error:', errorMessage);
      return Promise.reject({
        message: errorMessage,
      });
    }
  }
);

export default api;
