const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocal ? 'http://localhost:5000/api' : '/api';


export const formatImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;

    // For production, if API_BASE_URL is '/api', serverBase will be empty string
    // which results in relative paths like '/uploads/...'
    const serverBase = API_BASE_URL === '/api' ? '' : API_BASE_URL.replace('/api', '');
    return `${serverBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default API_BASE_URL;
