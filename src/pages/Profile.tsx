/* Developed & Owned by Bouchibat - bouchibattauomi@gmail.com - 2026 */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import GlassCard from "@/src/components/ui/GlassCard";
import Button from "@/src/components/ui/Button";
import { Settings, Shield, Mail, Globe, Info, LogOut, Copy, Gift, Check, ArrowRight } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { useApp } from "@/src/context/AppContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user, isAdmin, signOut } = useAuth();
  const { state, processReferral } = useApp();
  const navigate = useNavigate();
  const [referralInput, setReferralInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const languages = [
    { code: "en", name: "English" },
    { code: "ar", name: "العربية" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "zh", name: "中文" },
    { code: "hi", name: "हिन्दी" },
    { code: "pt", name: "Português" },
    { code: "ru", name: "Русский" }
  ];

  const selectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setShowLanguageModal(false);
  };

  const handleCopyCode = () => {
    if (state.referralCode) {
      navigator.clipboard.writeText(state.referralCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleApplyReferral = async () => {
    if (!referralInput) return;
    setIsProcessing(true);
    setMessage(null);
    const success = await processReferral(referralInput);
    if (success) {
      setMessage({ text: t("referral_success") || "Referral applied successfully!", type: 'success' });
      setReferralInput("");
    } else {
      setMessage({ text: t("referral_error") || "Invalid or already used referral code.", type: 'error' });
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Quick Access */}
      {isAdmin && (
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="px-1"
        >
          <GlassCard 
            className="p-4 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border-primary/30 flex items-center justify-between group cursor-pointer"
            onClick={() => navigate("/admin")}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <Shield size={20} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">{t("admin_control")}</h3>
                <p className="text-[8px] text-white/40 uppercase font-bold tracking-tight">{t("admin_control_desc")}</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <ArrowRight size={16} />
            </div>
          </GlassCard>
        </motion.div>
      )}

      <header className="text-center mt-4">
        <h1 className="text-3xl font-black">{t("profile")}</h1>
      </header>

      <GlassCard className="text-center p-8 relative overflow-hidden bg-gradient-to-b from-primary/10 to-transparent border-white/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 blur-3xl -mt-16 rounded-full" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary to-secondary p-1 mb-4 shadow-xl shadow-primary/20">
            <div className="w-full h-full rounded-[1.8rem] bg-dark-bg flex items-center justify-center overflow-hidden">
               <img 
                 src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'Profile'}`} 
                 className="w-full h-full object-cover"
                 alt="Avatar"
                 referrerPolicy="no-referrer"
                 crossOrigin="anonymous"
               />
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-tighter uppercase mb-1">{user?.displayName || "Player"}</h2>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 mb-6">
            <div className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">ID: #{user?.uid.substring(0, 8).toUpperCase()}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 flex flex-col items-center">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{t("membership")}</span>
              <span className="text-lg font-black text-primary italic">{state.level}</span>
            </div>
            <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 flex flex-col items-center">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{t("multiplier")}</span>
              <span className="text-lg font-black text-secondary tracking-tighter">{state.multiplier.toFixed(2)}x</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Referral Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t("referral_rewards")}</h3>
        <GlassCard className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">{t("your_referral_code")}</p>
              <p className="text-lg font-black tracking-widest text-primary">{state.referralCode || "..."}</p>
            </div>
            <Button variant="ghost" className="p-3" onClick={handleCopyCode}>
              {isCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            </Button>
          </div>
          
          <div className="border-t border-white/5 pt-4">
            <p className="text-[10px] text-gray-400 uppercase mb-2">{t("enter_code")}</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value)}
                placeholder={t("enter_code").toUpperCase()}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-black uppercase focus:outline-none focus:border-primary transition-colors"
                disabled={isProcessing}
              />
              <Button 
                variant="primary" 
                className="px-4 py-3" 
                onClick={handleApplyReferral}
                disabled={isProcessing}
              >
                <div className="flex items-center gap-2">
                   <Gift size={16} />
                   <span className="text-[10px] font-black">{t("apply").toUpperCase()}</span>
                </div>
              </Button>
            </div>
            {message && (
              <p className={`mt-2 text-[10px] font-bold ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {message.text}
              </p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Ownership Section - MANDATORY */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t("about")}</h3>
        <GlassCard className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Info size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">{t("about")}</p>
              <p className="text-sm font-bold">{t("owned_by")}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
              <Mail size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">{t("contact")}</p>
              <p className="text-sm font-bold">bouchibattauomi@gmail.com</p>
            </div>
          </div>
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setShowLanguageModal(true)}>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <Globe size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">{t("language")}</p>
              <p className="text-sm font-bold uppercase">
                {languages.find(l => l.code === i18n.language)?.name || "English"}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Security & Settings */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t("settings")}</h3>
        <div className="grid grid-cols-1 gap-2">
          {[
            { icon: Shield, label: t("vpn_detection"), status: t("status_active"), color: "text-accent-green" },
            { icon: Settings, label: t("account_security"), status: t("status_standard"), color: "text-gray-400" },
          ].map((item, i) => (
            <GlassCard key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <item.icon size={18} className="text-gray-400" />
                <span className="text-sm font-bold">{item.label}</span>
              </div>
              <span className={`text-[10px] font-black uppercase ${item.color}`}>{item.status}</span>
            </GlassCard>
          ))}
        </div>
      </div>

      <Button 
        variant="ghost" 
        className="w-full py-4 text-red-500 border-red-500/20 hover:bg-red-500/5"
        onClick={signOut}
      >
        <div className="flex items-center justify-center gap-2">
          <LogOut size={18} />
          <span className="text-sm font-bold">{t("sign_out")}</span>
        </div>
      </Button>

      <div className="text-center opacity-30 mt-8 pb-10">
        <p className="text-[10px] font-bold">BoyCash v1.0.0-PRO</p>
        <p className="text-[10px]">{t("copyright")}</p>
      </div>

      {/* Language Selection Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xs bg-dark-bg border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 bg-gradient-to-r from-primary/10 to-transparent">
                <h3 className="text-lg font-black uppercase tracking-widest">{t("language")}</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase">{t("app_name")} - System</p>
              </div>
              <div className="p-4 grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => selectLanguage(lang.code)}
                    className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                      i18n.language === lang.code 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    <span className="font-bold">{lang.name}</span>
                    {i18n.language === lang.code && <Check size={16} />}
                  </button>
                ))}
              </div>
              <div className="p-4 bg-white/5">
                <Button 
                  variant="ghost" 
                  className="w-full py-3 text-xs font-black uppercase"
                  onClick={() => setShowLanguageModal(false)}
                >
                  {t("close")}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
