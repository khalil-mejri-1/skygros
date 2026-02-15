# 🚀 دليل سريع - نظام API المركزي

## للمطورين الجدد

### 📍 الملف الرئيسي
```
client/src/config/api.js
```

هذا هو الملف الوحيد الذي يحتوي على عنوان API الأساسي.

---

## ✅ الاستخدام الصحيح

### 1. الاستيراد
```javascript
import API_BASE_URL from '../config/api';
```

### 2. الاستخدام
```javascript
// ✅ صحيح
axios.get(`${API_BASE_URL}/products`)
axios.post(`${API_BASE_URL}/auth/login`, data)
axios.put(`${API_BASE_URL}/users/${id}`, data)
axios.delete(`${API_BASE_URL}/products/${id}`)

// ❌ خطأ - لا تضف /api مرة أخرى
axios.get(`${API_BASE_URL}/api/products`)
```

---

## 🔧 تغيير البيئة

افتح `client/src/config/api.js`:

### التطوير المحلي
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

### الإنتاج
```javascript
const API_BASE_URL = 'https://skygros-nifd.vercel.app/api';
```

### مع Proxy (افتراضي)
```javascript
const API_BASE_URL = '/api';
```

---

## 📝 مثال كامل

```javascript
import { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const MyComponent = () => {
    const [data, setData] = useState([]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/products`);
            setData(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return <div>...</div>;
};
```

---

## ⚠️ قواعد مهمة

1. ❌ **لا تكتب URL مباشرة** في الكود
2. ✅ **استخدم دائماً** `API_BASE_URL`
3. ❌ **لا تضف** `/api` في الطلبات
4. ✅ **استورد** من `../config/api`

---

## 🎯 نقاط الاتصال (Endpoints)

جميع الطلبات تبدأ بـ `${API_BASE_URL}/`:

- `/auth/login` - تسجيل الدخول
- `/auth/register` - التسجيل
- `/products` - المنتجات
- `/users` - المستخدمين
- `/orders` - الطلبات
- `/categories` - الفئات
- `/settings` - الإعدادات
- `/demos` - الحسابات التجريبية

---

## 🆘 حل المشاكل

### خطأ 404
```
السبب: إضافة /api مرتين
الحل: استخدم ${API_BASE_URL}/endpoint فقط
```

### خطأ CORS
```
السبب: إعدادات Proxy خاطئة
الحل: تحقق من vite.config.js
```

### Cannot find module
```
السبب: مسار الاستيراد خاطئ
الحل: استخدم '../config/api' أو '../../config/api'
```

---

## 📚 ملفات إضافية

- `API_UPDATE_README.md` - ملخص التحديث
- `API_FIX_REPORT.md` - تقرير التغييرات
- `API_USAGE_GUIDE.md` - دليل شامل

---

**آخر تحديث:** 2026-02-15  
**الحالة:** ✅ جاهز للاستخدام
