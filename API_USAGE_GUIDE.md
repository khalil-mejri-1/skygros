# دليل استخدام نظام API المركزي

## نظرة عامة

تم تحديث المشروع ليستخدم نظام مركزي لإدارة عناوين API. جميع الملفات الآن تستقبل `API_BASE_URL` من ملف واحد: `client/src/config/api.js`

## البنية الحالية

```
client/
├── src/
│   ├── config/
│   │   └── api.js          ← الملف المركزي لإعدادات API
│   ├── pages/
│   │   ├── Admin.jsx       ← يستورد API_BASE_URL
│   │   ├── Home.jsx        ← يستورد API_BASE_URL
│   │   ├── Login.jsx       ← يستورد API_BASE_URL
│   │   └── ...
│   └── components/
│       ├── Navbar.jsx      ← يستورد API_BASE_URL
│       └── ...
└── vite.config.js          ← إعدادات Proxy
```

## كيفية الاستخدام

### 1. في أي ملف جديد

عند إنشاء ملف جديد يحتاج لاستدعاء API:

```javascript
// 1. استيراد API_BASE_URL
import API_BASE_URL from '../config/api';
import axios from 'axios';

// 2. استخدامه في الاستدعاءات
const fetchData = async () => {
    try {
        // ✅ صحيح
        const response = await axios.get(`${API_BASE_URL}/products`);
        
        // ❌ خطأ - لا تضف /api مرة أخرى
        // const response = await axios.get(`${API_BASE_URL}/api/products`);
        
        return response.data;
    } catch (error) {
        console.error(error);
    }
};
```

### 2. أمثلة على الاستخدام الصحيح

#### GET Request
```javascript
const products = await axios.get(`${API_BASE_URL}/products`);
```

#### POST Request
```javascript
const newUser = await axios.post(`${API_BASE_URL}/auth/register`, userData);
```

#### PUT Request
```javascript
const updated = await axios.put(`${API_BASE_URL}/products/${id}`, updatedData);
```

#### DELETE Request
```javascript
await axios.delete(`${API_BASE_URL}/products/${id}`);
```

#### مع Fetch API
```javascript
const response = await fetch(`${API_BASE_URL}/settings`);
const data = await response.json();
```

## تغيير بيئة العمل

### البيئات المتاحة

افتح ملف `client/src/config/api.js` وقم بتفعيل البيئة المطلوبة:

#### 1. التطوير المحلي (Local Development)
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```
استخدم هذا عندما يكون السيرفر يعمل على جهازك المحلي.

#### 2. الإنتاج (Production)
```javascript
const API_BASE_URL = 'https://skygros-nifd.vercel.app/api';
```
استخدم هذا عند النشر على Vercel أو أي خادم إنتاج.

#### 3. مع Proxy (الإعداد الحالي)
```javascript
const API_BASE_URL = '/api';
```
استخدم هذا عند التطوير مع Vite Proxy (الإعداد الافتراضي).

### كيفية التبديل

1. افتح `client/src/config/api.js`
2. علّق على السطر الحالي
3. أزل التعليق عن السطر المطلوب
4. احفظ الملف
5. أعد تشغيل التطبيق

**مثال:**
```javascript
// للتبديل من Proxy إلى Production:

// قبل:
const API_BASE_URL = '/api';

// بعد:
// const API_BASE_URL = '/api';
const API_BASE_URL = 'https://skygros-nifd.vercel.app/api';
```

## إعدادات Proxy

في ملف `client/vite.config.js`:

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://skygros.vercel.app',
        changeOrigin: true,
      },
    },
  },
})
```

عند استخدام `API_BASE_URL = '/api'`، سيقوم Vite بتوجيه جميع الطلبات إلى `https://skygros.vercel.app/api`.

## الأخطاء الشائعة وحلولها

### ❌ خطأ: 404 Not Found

**السبب:** إضافة `/api` مرتين

```javascript
// ❌ خطأ
axios.get(`${API_BASE_URL}/api/products`)
// النتيجة: /api/api/products

// ✅ صحيح
axios.get(`${API_BASE_URL}/products`)
// النتيجة: /api/products
```

### ❌ خطأ: CORS Error

**السبب:** عدم استخدام Proxy أو URL خاطئ

**الحل:**
1. تأكد من إعدادات Proxy في `vite.config.js`
2. أو استخدم URL كامل مع CORS مفعّل على السيرفر

### ❌ خطأ: Cannot find module '../config/api'

**السبب:** مسار الاستيراد خاطئ

**الحل:**
```javascript
// تأكد من المسار النسبي الصحيح
// من pages/
import API_BASE_URL from '../config/api';

// من components/
import API_BASE_URL from '../config/api';

// من pages/subfolder/
import API_BASE_URL from '../../config/api';
```

## نصائح للمطورين

1. **لا تكتب URL مباشرة:** دائماً استخدم `API_BASE_URL`
2. **تحقق من المسار:** لا تضف `/api` في الاستدعاء
3. **استخدم متغيرات البيئة:** للمشاريع الكبيرة، فكر في استخدام `.env`
4. **اختبر بعد التغيير:** عند تغيير البيئة، اختبر جميع الوظائف

## مثال كامل

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // استدعاء API باستخدام API_BASE_URL
                const response = await axios.get(`${API_BASE_URL}/products`);
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            {products.map(product => (
                <div key={product._id}>{product.name}</div>
            ))}
        </div>
    );
};

export default ProductList;
```

## الخلاصة

✅ **جميع استدعاءات API الآن مركزية**
✅ **سهولة تغيير البيئة من مكان واحد**
✅ **تجنب الأخطاء والتكرار**
✅ **كود أنظف وأسهل في الصيانة**
