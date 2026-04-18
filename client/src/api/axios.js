import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Add a request interceptor to add the JWT to headers
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      if (config.headers && config.headers.set) {
        config.headers.set('Authorization', `Bearer ${user.token}`);
      } else {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${user.token}`,
        };
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
