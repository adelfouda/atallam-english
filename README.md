# أتعلم إنجليزي

تطبيق ويب لتعلم الإنجليزي بالنطق الأمريكي والبريطاني.

## محتويات المشروع
- public/index.html : التطبيق كامل في ملف واحد
- public/manifest.webmanifest و public/sw.js : التثبيت على الشاشة والعمل بدون إنترنت
- public/icons : الأيقونات
- firebase.json و firestore.rules و .firebaserc : إعدادات الرفع

## مشروع الرفع
- المشروع المقترح على فايربيز: atallam-english
- الرابط المتوقع: https://atallam-english.web.app

## خطوات الرفع
1. firebase projects:create atallam-english
2. firebase deploy --only hosting

## المزامنة بين الأجهزة
تسجيل الدخول بجوجل بيشتغل لما نحط إعدادات مشروع فايربيز مكان القيمة
FIREBASE_CONFIG = null
في آخر ملف index.html، ونفعّل تسجيل الدخول بجوجل وقاعدة البيانات، ونرفع قواعد الحماية:
firebase deploy --only firestore:rules
