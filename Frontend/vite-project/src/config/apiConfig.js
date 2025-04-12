// client/src/apiConfig.js
import axios from 'axios';

// If you want to configure from an .env, define REACT_APP_API_URL in .env
const baseURL = import.meta.env.VITE_APP_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL,
  withCredentials: true, // allow sending cookies (for session auth)
});

export default api;
