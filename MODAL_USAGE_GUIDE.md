# استخدام نوافذ التأكيد والتنبيه الاحترافية

تم إنشاء مكونين جديدين لاستبدال `alert()` و `window.confirm()` بنوافذ احترافية وجميلة:

## المكونات المتوفرة:

### 1. ConfirmModal - نافذة التأكيد
تستخدم لطلب تأكيد من المستخدم قبل تنفيذ إجراء معين.

### 2. AlertModal - نافذة التنبيه
تستخدم لعرض رسائل النجاح أو الخطأ أو المعلومات.

---

## كيفية الاستخدام:

### الخطوة 1: استيراد المكونات
```javascript
import ConfirmModal from "../components/ConfirmModal";
import AlertModal from "../components/AlertModal";
```

### الخطوة 2: إضافة الـ State
```javascript
const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    title: "", 
    message: "", 
    onConfirm: null, 
    type: "warning" 
});

const [alertModal, setAlertModal] = useState({ 
    isOpen: false, 
    title: "", 
    message: "", 
    type: "success" 
});
```

### الخطوة 3: استخدام ConfirmModal بدلاً من window.confirm()

**قبل:**
```javascript
if (window.confirm("هل أنت متأكد؟")) {
    // تنفيذ الإجراء
    await deleteItem();
}
```

**بعد:**
```javascript
setConfirmModal({
    isOpen: true,
    title: "تأكيد الحذف",
    message: "هل أنت متأكد من حذف هذا العنصر؟ هذا الإجراء لا يمكن التراجع عنه.",
    type: "danger", // warning, danger, success, info
    confirmColor: "#ff4757",
    confirmText: "حذف",
    cancelText: "إلغاء",
    onConfirm: async () => {
        await deleteItem();
        setConfirmModal({ ...confirmModal, isOpen: false });
        setAlertModal({ 
            isOpen: true, 
            title: "تم الحذف!", 
            message: "تم حذف العنصر بنجاح.", 
            type: "success" 
        });
    }
});
```

### الخطوة 4: استخدام AlertModal بدلاً من alert()

**قبل:**
```javascript
alert("تمت العملية بنجاح!");
```

**بعد:**
```javascript
setAlertModal({ 
    isOpen: true, 
    title: "نجاح!", 
    message: "تمت العملية بنجاح.", 
    type: "success" // success, error, info
});
```

### الخطوة 5: إضافة المكونات في JSX
```javascript
return (
    <div>
        {/* محتوى الصفحة */}
        
        {/* النوافذ المنبثقة */}
        <ConfirmModal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            onConfirm={confirmModal.onConfirm}
            title={confirmModal.title}
            message={confirmModal.message}
            type={confirmModal.type}
            confirmText={confirmModal.confirmText}
            confirmColor={confirmModal.confirmColor}
        />
        
        <AlertModal
            isOpen={alertModal.isOpen}
            onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
            title={alertModal.title}
            message={alertModal.message}
            type={alertModal.type}
        />
    </div>
);
```

---

## أمثلة على الأنواع المختلفة:

### تأكيد خطير (Danger)
```javascript
setConfirmModal({
    isOpen: true,
    title: "حذف الحساب",
    message: "سيتم حذف جميع بياناتك نهائياً!",
    type: "danger",
    confirmColor: "#ff4757",
    confirmText: "حذف نهائي"
});
```

### تحذير (Warning)
```javascript
setConfirmModal({
    isOpen: true,
    title: "تحذير",
    message: "هذا الإجراء قد يؤثر على البيانات الأخرى.",
    type: "warning",
    confirmColor: "#ff9900"
});
```

### رسالة نجاح
```javascript
setAlertModal({ 
    isOpen: true, 
    title: "تم بنجاح!", 
    message: "تمت إضافة المنتج إلى السلة.", 
    type: "success" 
});
```

### رسالة خطأ
```javascript
setAlertModal({ 
    isOpen: true, 
    title: "خطأ", 
    message: "حدث خطأ أثناء معالجة طلبك.", 
    type: "error" 
});
```

---

## الملفات التي تحتاج تحديث:

✅ Admin.jsx - تم التحديث
⏳ Demos.jsx - يحتاج تحديث
⏳ Panier.jsx - يحتاج تحديث
⏳ ProductDetails.jsx - يحتاج تحديث

يمكنك تطبيق نفس الأسلوب في جميع الصفحات الأخرى!
