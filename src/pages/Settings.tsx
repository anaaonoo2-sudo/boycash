/* Developed & Owned by Bouchibat - bouchibattauomi@gmail.com - 2026 */
import { useTranslation } from "react-i18next";
import GlassCard from "@/src/components/ui/GlassCard";
import Button from "@/src/components/ui/Button";
import { Globe, Bell, Shield, Mail, LogOut, ChevronRight, Smartphone, FileText } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      alert(t("pwa_manual_instructions"));
    }
  };

  const toggleLanguage = () => {
    const langs = ['en', 'ar', 'fr', 'es', 'zh', 'hi', 'pt', 'ru'];
    const currentIdx = langs.indexOf(i18n.language);
    const nextLang = langs[(currentIdx + 1) % langs.length];
    i18n.changeLanguage(nextLang);
  };

  const sections = [
    {
      icon: Globe,
      label: t("language"),
      value: i18n.language.toUpperCase(),
      onClick: toggleLanguage
    },
    {
      icon: Bell,
      label: t("notifications"),
      value: t("status_enabled"),
      onClick: () => {}
    },
    {
      icon: Shield,
      label: t("privacy_policy"),
      onClick: () => navigate('/privacy')
    },
    {
      icon: FileText,
      label: t("terms_of_service") || "Terms of Service",
      onClick: () => navigate('/terms')
    },
    {
      icon: Mail,
      label: t("contact_support"),
      onClick: () => navigate('/support')
    },
  ];

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">{t("settings")}</h1>
      </header>

      <div className="space-y-3">
        <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-2">{t("app_system_header")}</h2>

        <GlassCard
          className="p-5 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer"
          onClick={handleInstall}
        >
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-primary text-white">
              <Smartphone size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {t("install_app_phone")}
              </p>
              <p className="text-[10px] text-primary/60 font-medium">
                {t("install_app_desc")}
              </p>
            </div>
          </div>
        </GlassCard>

        {sections.map((item, i) => (
          <GlassCard
            key={i}
            className="p-5 flex items-center justify-between hover:border-white/20 transition-all cursor-pointer"
            onClick={item.onClick}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-primary">
                <item.icon size={20} />
              </div>
              <span className="text-sm font-bold">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.value && (
                <span className="text-[10px] font-black uppercase text-gray-500 bg-white/5 px-2 py-1 rounded-md tracking-widest">
                  {item.value}
                </span>
              )}
              <ChevronRight size={16} className="text-gray-700" />
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="pt-6 space-y-4">
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-500/10 border-red-500/20"
        >
          <LogOut size={18} />
          <span className="font-black uppercase tracking-widest text-xs">{t("sign_out")}</span>
        </Button>

        <div className="p-6 text-center space-y-3 opacity-50">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-primary">{t("apk_build_support")}</p>
            <p className="text-[9px] leading-relaxed">
              {t("zip_capacitor_desc")}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[8px] font-black uppercase tracking-[0.4em]">BoyCash v1.0.4</p>
            <p className="text-[10px] font-bold">{t("copyright")}</p>
            <p className="text-[8px] italic">bouchibattauomi@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
