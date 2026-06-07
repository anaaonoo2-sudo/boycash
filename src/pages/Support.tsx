import React, { useState } from 'react';
import { Headset, Send, MessageCircle, HelpCircle, ArrowLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Support = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to a server or Firebase
    console.log({ subject, message });
    setSubmitted(true);
  };

  const faqs = [
    { q: "متى يتم دفع الأرباح؟", a: "تتم معالجة السحوبات عادةً خلال 48 ساعة." },
    { q: "كيف أحصل على نقاط أكثر؟", a: "عن طريق إكمال المهام اليومية ودعوة الأصدقاء." },
    { q: "هل التطبيق متاح في جميع الدول؟", a: "نعم، BoyCash يعمل عالمياً ويدعم طرق سحب محلية." },
  ];

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
            <Headset size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tight">مركز الدعم</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Support Center</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* FAQ Section */}
          <div className="glass-card p-6 border-white/10" dir="rtl">
            <h2 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
              <HelpCircle size={18} className="text-primary" />
              الأسئلة الشائعة
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 transition-all hover:bg-white/[0.08]">
                  <p className="font-bold text-sm text-white mb-1">{faq.q}</p>
                  <p className="text-xs text-gray-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card p-6 border-white/10" dir="rtl">
            <h2 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
              <MessageCircle size={18} className="text-primary" />
              أرسل لنا رسالة
            </h2>
            {submitted ? (
              <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send size={24} className="text-green-500" />
                </div>
                <p className="text-green-500 font-bold mb-1">تم إرسال رسالتك بنجاح!</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">فريقنا سيرد عليك قريباً عبر البريد الإلكتروني.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-[10px] text-white/40 hover:text-white underline uppercase tracking-widest"
                >
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-black">الموضوع</label>
                  <input 
                    type="text" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="مثال: مشكلة في السحب"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-black">رسالتك</label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="اكتب تفاصيل مشكلتك هنا..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-primary text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all shadow-[0_10px_30px_rgba(59,130,246,0.3)]"
                >
                  <Send size={18} />
                  <span className="text-xs uppercase tracking-widest">إرسال الآن</span>
                </button>
              </form>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <a 
               href="https://t.me/BoyCashSupport" 
               target="_blank" 
               className="glass-card p-4 flex flex-col items-center gap-3 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors"
             >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                   <Send size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Telegram</span>
             </a>
             <a 
               href="https://wa.me/212600000000" 
               target="_blank" 
               className="glass-card p-4 flex flex-col items-center gap-3 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
             >
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                   <MessageCircle size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
             </a>
          </div>

          <div className="text-center p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-black">أو تواصل مباشرة عبر</p>
            <a href="mailto:anaaonoo2@gmail.com" className="flex items-center justify-center gap-2 text-primary hover:underline font-bold text-sm">
              <Mail size={16} />
              anaaonoo2@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
