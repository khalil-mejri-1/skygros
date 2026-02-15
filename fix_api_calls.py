import os
import re
import sys

# Set UTF-8 encoding for console output
if sys.platform == "win32":
    import codecs

    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.buffer, "strict")

# المسار الأساسي للمشروع
base_path = r"c:\Users\khalil\Desktop\khalil\project_react\skygros\client\src"

# قائمة بجميع الملفات التي تحتاج للتعديل
files_to_fix = [
    "pages/TwoFAVerify.jsx",
    "pages/TwoFASetup.jsx",
    "pages/Register.jsx",
    "pages/Profile.jsx",
    "pages/Products.jsx",
    "pages/ProductDetails.jsx",
    "pages/Panier.jsx",
    "pages/Login.jsx",
    "pages/Home.jsx",
    "pages/Historique.jsx",
    "pages/Demos.jsx",
    "pages/Admin.jsx",
    "components/ProductCard.jsx",
    "components/Navbar.jsx",
    "components/GlobalNotifications.jsx",
]

# Pattern للبحث عن ${API_BASE_URL}/api/
pattern = re.compile(r"\$\{API_BASE_URL\}/api/")

# عداد للملفات المعدلة
modified_count = 0
total_replacements = 0

for file_path in files_to_fix:
    full_path = os.path.join(base_path, file_path)

    if not os.path.exists(full_path):
        print(f"[!] File not found: {file_path}")
        continue

    # قراءة محتوى الملف
    with open(full_path, "r", encoding="utf-8") as f:
        content = f.read()

    # البحث عن التطابقات
    matches = pattern.findall(content)

    if matches:
        # استبدال ${API_BASE_URL}/api/ بـ ${API_BASE_URL}/
        new_content = pattern.sub("${API_BASE_URL}/", content)

        # كتابة المحتوى المعدل
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(new_content)

        modified_count += 1
        total_replacements += len(matches)
        print(f"[+] Modified: {file_path} ({len(matches)} replacements)")
    else:
        print(f"[=] No changes needed: {file_path}")

print(f"\n{'='*60}")
print(f"Summary:")
print(f"   - Files modified: {modified_count}")
print(f"   - Total replacements: {total_replacements}")
print(f"{'='*60}")
