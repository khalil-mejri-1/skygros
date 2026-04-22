const isLocal = window.location.hostname === 'localhost';
const API_BASE_URL = isLocal 
    ? 'http://localhost:5000/api' 
    : 'https://skygros.com/api';


export const formatImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;

    // Remove /api from the end of base URL to get the server root
    const serverBase = API_BASE_URL.replace(/\/api$/, '').replace(/\/api\/$/, '');
    
    // Ensure the url starts with / if it doesn't already
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    return `${serverBase}${cleanUrl}`;
};

export default API_BASE_URL;
