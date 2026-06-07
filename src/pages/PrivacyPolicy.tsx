import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>الرجوع</span>
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tight">سياسة الخصوصية</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Privacy Policy</p>
          </div>
        </div>

        <div className="glass-card p-8 border-white/10 space-y-8 text-sm text-gray-400 leading-relaxed text-right font-sans" dir="rtl">
          <section>
            <h2 className="text-white font-black mb-4 text-xl border-b border-white/5 pb-2">1. مقدمة</h2>
            <p>مرحباً بكم في BoyCash. خصوصيتكم تعني لنا الكثير. تهدف هذه السياسة إلى توضيح كيف نجمع ونستخدم ونحمي بياناتكم الشخصية عند استخدام تطبيقنا.</p>
          </section>

          <section>
            <h2 className="text-white font-black mb-4 text-xl border-b border-white/5 pb-2">2. البيانات التي نجمعها</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>معلومات الحساب:</strong> مثل البريد الإلكتروني وصورة الملف الشخصي عند التسجيل عبر Google.</li>
              <li><strong>معرفات الجهاز:</strong> نقوم بجمع معرف الجهاز لضمان تقديم المكافآت ومنع الاحتيال وتعدد الحسابات.</li>
              <li><strong>البيانات التقنية:</strong> مثل نوع المتصفح، نظام التشغيل، وعنوان الـ IP لأغراض أمنية.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-black mb-4 text-xl border-b border-white/5 pb-2">3. خدمات الطرف الثالث</h2>
            <p>نحن نتعاون مع مزودي خدمات إعلانية (مثل Google AdMob و CPAGrip) لتقديم العروض والمكافآت. قد يقوم هؤلاء الشركاء بجمع معلومات مجهولة المصدر لتحسين استهداف الإعلانات.</p>
          </section>

          <section>
            <h2 className="text-white font-black mb-4 text-xl border-b border-white/5 pb-2">4. أمان البيانات</h2>
            <p>نستخدم بروتوكولات حماية متطورة وتشفير البيانات عبر خوادم Google Firebase لضمان عدم وصول أي طرف غير مصرح له إلى معلوماتك الحساسة أو أرباحك.</p>
          </section>

          <section>
            <h2 className="text-white font-black mb-4 text-xl border-b border-white/5 pb-2">5. استخدام ملفات تعريف الارتباط</h2>
            <p>نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربة المستخدم وحفظ تفضيلات اللغة وضمان بقاء الجلسة نشطة بشكل آمن.</p>
          </section>

          <section>
            <h2 className="text-white font-black mb-4 text-xl border-b border-white/5 pb-2">6. التغييرات في السياسة</h2>
            <p>نحتفظ بالحق في تحديث هذه السياسة في أي وقت. سيتم إخطار المستخدمين بأي تغييرات جوهرية عبر إشعارات داخل التطبيق.</p>
          </section>

          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest italic">آخر تحديث: مايو 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
