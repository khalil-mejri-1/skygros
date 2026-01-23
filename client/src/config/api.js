// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD
    ? 'https://skygros.vercel.app'
    : 'http://localhost:5000');

export default API_BASE_URL;
// https://skygros.vercel.app