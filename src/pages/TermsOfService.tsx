import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
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
          <div className="w-12 h-12 rounded-2xl bg-accent-orange/20 flex items-center justify-center text-accent-orange">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tight">شروط الخدمة</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Terms of Service</p>
          </div>
        </div>

        <div className="glass-card p-8 border-white/10 space-y-8 text-sm text-gray-400 leading-relaxed text-right font-sans" dir="rtl">
          <section>
            <h2 className="text-white font-black mb-4 text-xl border-b border-white/5 pb-2">1. الأهلية والاستخدام</h2>
            <p>باستخدامك لتطبيق BoyCash، فإنك تقر بأن عمرك لا يقل عن 13 عاماً (أو السن القانوني في بلدك). يقتصر استخدام التطبيق على الأغراض الشخصية فقط ويمنع استخدامه لأي أغراض تجارية غير مصرح بها.</p>
          </section>

          <section>
            <h2 className="text-white font-black mb-4 text-xl border-b border-white/5 pb-2">2. سياسة الحسابات المتعددة والغش</h2>
            <p>يُسمح بحساب واحد فقط لكل مستخدم ولكل جهاز. استخدام برامج الـ VPN، أدوات تغيير الـ IP، أو أي وسيلة للتلاعب بموقعك الجغرافي أو هويتك سيؤدي إلى <strong>الحظر النهائي الفوري</strong> وحذف جميع الأرباح دون سابق إنذار.</p>
          </section>

          <section>
            <h2 className="text-white font-black mb-4 text-xl border-b border-white/5 pb-2">3. نظام المكافآت والسحوبات</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>يتم منح النقاط بعد التحقق من إتمام المهمة بشكل كامل.</li>
              <li>قد تخضع طلبات السحب للمراجعة اليدوية لضمان عدم وجود نشاط احتيالي.</li>
              <li>نحن غير مسؤولين عن أي أخطاء في بيانات السحب المقدمة من قبل المستخدم.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-black mb-4 text-xl border-b border-white/5 pb-2">4. حقوق الملكية</h2>
            <p>جميع العلامات التجارية والرموز والمحتويات داخل تطبيق BoyCash هي ملكية خاصة لنا. لا يجوز إعادة إنتاجها أو توزيعها دون إذن كتابي مسبق.</p>
          </section>

          <section>
            <h2 className="text-white font-black mb-4 text-xl border-b border-white/5 pb-2">5. إخلاء المسؤولية</h2>
            <p>نحن نسعى لتقديم أفضل خدمة ممكنة، ولكننا لا نضمن توفر التطبيق دون انقطاع. نحن غير مسؤولين عن أي خسائر فنية ناتجة عن مشاكل في الاتصال بالإنترنت لديك.</p>
          </section>

          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest italic">آخر تحديث: مايو 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
