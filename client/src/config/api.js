// const API_BASE_URL = 'https://skygros.vercel.app/api';
// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'https://skygros.com/api';


export const formatImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;

    // Base URL is usually https://domain.com/api
    // We want https://domain.com + url
    const serverBase = API_BASE_URL.replace('/api', '');
    return `${serverBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default API_BASE_URL;
