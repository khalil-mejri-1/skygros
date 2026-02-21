// API Configuration
// استخدم أحد الخيارات التالية حسب البيئة:

// للتطوير المحلي (Development):
// const API_BASE_URL = 'http://localhost:5000/api';

// للإنتاج (Production):
// const API_BASE_URL = 'https://skygros-nifd.vercel.app/api';

// للاستخدام مع Proxy (الإعداد الحالي):
const API_BASE_URL = 'http://localhost:5000/api';

// تصدير API_BASE_URL كـ default export
export default API_BASE_URL;