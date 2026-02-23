// API Configuration
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// للتطوير المحلي نستخدم الـ Proxy المبرمج في vite.config.js
// للإنتاج نستخدم الرابط المباشر للسيرفر لضمان عمل الصور والطلبات
export const API_BASE_URL = !isLocal
    ? '/api'
    : 'http://localhost:5000/api';

export const formatImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;

    // Remove /api from the end for the base assets URL
    const baseUrl = API_BASE_URL.replace(/\/api$/, '');
    return `${baseUrl}${url}`;
};

export default API_BASE_URL;