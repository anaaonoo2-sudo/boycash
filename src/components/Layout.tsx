/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { House, Zap, Wallet, Trophy, User, Settings as SettingsIcon, MessageCircleCode } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import CoinIcon from "./ui/CoinIcon";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation();
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
      <header className="fixed top-0 left-0 right-0 z-[60] bg-black/40 backdrop-blur-2xl px-4 py-3 flex items-center justify-between border-b border-white/10 shadow-2xl">
        <div className="flex items-center gap-2">
           <CoinIcon size={32} />
           <span className="text-sm font-black uppercase tracking-[0.2em] text-white/90">{t("app_name")}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/assistant')}
            className={cn(
              "p-2 rounded-xl border transition-all duration-300",
              location.pathname === '/assistant' 
                ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/20 scale-110" 
                : "bg-white/5 text-gray-500 border-white/10 hover:border-white/20"
            )}
          >
            <MessageCircleCode size={20} />
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className={cn(
              "p-2 rounded-xl border transition-all duration-300",
              location.pathname === '/settings' 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-110" 
                : "bg-white/5 text-gray-500 border-white/10 hover:border-white/20"
            )}
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-20 pb-8">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-sm glass-card py-3 px-6 flex justify-between items-center z-50 rounded-[2.5rem] border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-[40px]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="no-underline transition-transform active:scale-90"
          >
            {({ isActive }) => (
              <div className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-500 relative",
                isActive ? "text-primary" : "text-gray-500"
              )}>
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute -top-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_#a855f7]"
                  />
                )}
                <div className={cn(
                  "p-2 rounded-2xl transition-all duration-300",
                  isActive ? "bg-primary/10 shadow-[inset_0_0_10px_rgba(168,85,247,0.2)]" : "transparent"
                )}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive && "drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]")} />
                </div>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <footer className="w-full text-center py-4 text-[10px] text-gray-600">
        <p>{t("copyright")}</p>
        <p>anaaonoo2@gmail.com</p>
      </footer>
    </div>
  );
}
