import axios from 'axios';

// Create a custom axios instance for the app
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000, // 30 second timeout seems reasonable for AI analysis
});

/**
 * Request Interceptor: 
 * Attach the user's token from localStorage to every outgoing request.
 */
httpClient.interceptors.request.use(
  (config) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.token) {
        config.headers['Authorization'] = `Bearer ${user.token}`;
      }
    } catch (e) {
      // If JSON parsing fails, just ignore it and send without token
      console.warn('Failed to parse user from localStorage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Global error handling for common status codes (401, 500, etc.)
 */
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 Unauthorized, we might want to log the user out
    if (error.response && error.response.status === 401) {
      console.log('Session expired. Logging out...');
      // localStorage.removeItem('user');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default httpClient;
