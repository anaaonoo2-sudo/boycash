/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { House, Zap, Wallet, Trophy, User, Settings as SettingsIcon, MessageCircleCode } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "../context/AuthContext";
import CoinIcon from "./ui/CoinIcon";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation();
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    document.dir = isRTL ? "rtl" : "ltr";
  }, [isRTL]);

  const navItems = [
    { icon: House, label: t("dashboard"), path: "/" },
    { icon: Zap, label: t("earn"), path: "/earn" },
    { icon: Wallet, label: t("wallet"), path: "/wallet" },
    { icon: Trophy, label: t("leaderboard"), path: "/leaderboard" },
    { icon: User, label: t("profile"), path: "/profile" },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-24 overflow-x-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="bg-mesh pointer-events-none">
        <div className="blob top-[-10%] left-[-10%] bg-purple-600/30" />
        <div className="blob top-[40%] right-[-10%] bg-blue-600/20 animation-delay-2000" />
        <div className="blob bottom-[-10%] left-[20%] bg-pink-600/20 animation-delay-4000" />
      </div>

      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-[60] bg-transparent backdrop-blur-[40px] px-6 py-4 flex items-center justify-between border-b border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
           <div className="p-2 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-[0_0_20px_rgba(168,85,247,0.3)]">
             <CoinIcon size={24} />
           </div>
           <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/90 drop-shadow-sm">{t("app_name")}</span>
        </div>
        
        <div className="flex items-center gap-3">
          {user && (
            <>
              <button 
                onClick={() => navigate('/assistant')}
                className={cn(
                  "p-3 rounded-2xl border transition-all duration-500 hover:scale-105 active:scale-95",
                  location.pathname === '/assistant' 
                    ? "bg-primary text-white border-primary shadow-[0_0_25px_rgba(168,85,247,0.4)]" 
                    : "bg-white/[0.03] text-gray-400 border-white/[0.08] hover:border-white/20 hover:text-white"
                )}
              >
                <div className="relative">
                  <MessageCircleCode size={20} />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-green rounded-full shadow-[0_0_8px_#10b981] animate-pulse" />
                </div>
              </button>
              <button 
                onClick={() => navigate('/settings')}
                className={cn(
                  "p-3 rounded-2xl border transition-all duration-500 hover:scale-105 active:scale-95",
                  location.pathname === '/settings' 
                    ? "bg-secondary text-white border-secondary shadow-[0_0_25px_rgba(59,130,246,0.4)]" 
                    : "bg-white/[0.03] text-gray-400 border-white/[0.08] hover:border-white/20 hover:text-white"
                )}
              >
                <SettingsIcon size={20} />
              </button>
            </>
          )}
        </div>
      </header>

      <main className={cn(
        "flex-1 w-full mx-auto px-4 sm:px-6 pt-24 transition-all duration-700 ease-in-out",
        location.pathname === "/assistant" ? "pb-0" : "pb-12",
        isAdmin ? "max-w-6xl" : "max-w-xl",
        !user && "max-w-4xl"
      )}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {user && (
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-lg glass-card py-4 px-6 flex justify-between items-center z-50 rounded-[2.5rem] border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-[40px]">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="no-underline transition-all duration-300"
            >
              {({ isActive }) => (
                <div className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-500 relative",
                  isActive ? "text-primary scale-110" : "text-gray-500 hover:text-gray-300"
                )}>
                  <div className={cn(
                    "p-2.5 rounded-2xl transition-all duration-500",
                    isActive ? "bg-primary/15 shadow-[inset_0_0_15px_rgba(168,85,247,0.3)]" : "transparent"
                  )}>
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive && "drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]")} />
                  </div>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_#a855f7]"
                    />
                  )}
                </div>
              )}
            </NavLink> 
          ))}
        </nav>
      )}

      <footer className={cn("w-full text-center py-8 text-[9px] text-gray-700 flex flex-col gap-3 font-sans", location.pathname === "/assistant" && "hidden")}>
        <div className="flex justify-center gap-6 uppercase font-black tracking-[0.2em] opacity-50">
          <NavLink to="/privacy" className="hover:text-primary transition-all hover:tracking-[0.3em]">{t("privacy_policy")}</NavLink>
          <span className="opacity-10 scale-150">•</span>
          <NavLink to="/terms" className="hover:text-primary transition-all hover:tracking-[0.3em]">{t("terms_of_service")}</NavLink>
        </div>
        <div className="flex flex-col gap-1 opacity-30 font-bold uppercase tracking-widest">
          <p>{t("copyright")}</p>
          <p className="lowercase tracking-normal italic">Contact: anaaonoo2@gmail.com</p>
        </div>
      </footer>
    </div>
  );
}
