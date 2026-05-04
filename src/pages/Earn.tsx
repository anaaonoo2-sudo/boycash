/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import GlassCard from "@/src/components/ui/GlassCard";
import { RefreshCcw, Layers, Hash, Globe, Users, X, PlayCircle, Lock, BadgeDollarSign } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/src/context/AppContext";
import Button from "@/src/components/ui/Button";
import confetti from "canvas-confetti";
import CoinIcon from "@/src/components/ui/CoinIcon";
import { cn } from "@/src/lib/utils";
import { toast } from "react-hot-toast";

const earnOptions = [
  { 
    id: "admob", 
    icon: PlayCircle, 
    name: "watch_ad", 
    desc: "watch_ad_desc", 
    reward: "10", 
    color: "text-amber-400", 
    bg: "bg-amber-500/20",
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    border: "border-amber-500/20",
    shadow: "shadow-amber-500/5"
  },
  { 
    id: "offers", 
    icon: BadgeDollarSign, 
    name: "exclusive_offers", 
    desc: "high_reward_offers", 
    reward: "5-5000", 
    color: "text-emerald-400", 
    bg: "bg-emerald-500/20",
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    border: "border-emerald-500/20",
    shadow: "shadow-emerald-500/5"
  },
  { 
    id: "spin", 
    icon: RefreshCcw, 
    name: "spin_wheel", 
    desc: "daily_wheel_desc", 
    reward: "5-200", 
    color: "text-purple-400", 
    bg: "bg-purple-500/20",
    gradient: "from-purple-500/20 via-purple-500/5 to-transparent",
    border: "border-purple-500/20",
    shadow: "shadow-purple-500/5"
  },
  { 
    id: "scratch", 
    icon: Layers, 
    name: "scratch_win", 
    desc: "instant_win_desc", 
    reward: "10-150", 
    color: "text-blue-400", 
    bg: "bg-blue-500/20",
    gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
    border: "border-blue-500/20",
    shadow: "shadow-blue-500/5"
  },
  { 
    id: "quiz", 
    icon: Hash, 
    name: "math_quiz", 
    desc: "hard_mode", 
    reward: "15/45", 
    color: "text-rose-400", 
    bg: "bg-rose-500/20",
    gradient: "from-rose-500/20 via-rose-500/5 to-transparent",
    border: "border-rose-500/20",
    shadow: "shadow-rose-500/5"
  },
];

export default function Earn() {
  const { t } = useTranslation();
  const { addCoins, awardAdReward, state } = useApp();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const adsDisabled = import.meta.env.VITE_DISABLE_ADS === "true";

  const handleRewardedAd = () => {
    const anyWindow = window as any;
    const AD_UNIT_ID = import.meta.env.VITE_ADMOB_REWARDED_ID || "ca-app-pub-3940256099942544/5224354917";
    
    // 1. Mobile Bridge Logic (If running inside an Android/iOS App wrapper)
    if (anyWindow.Android && anyWindow.Android.showRewardedAd) {
      anyWindow.Android.showRewardedAd(AD_UNIT_ID);
      return;
    }
    if (anyWindow.webkit && anyWindow.webkit.messageHandlers && anyWindow.webkit.messageHandlers.showRewardedAd) {
      anyWindow.webkit.messageHandlers.showRewardedAd.postMessage({ unitId: AD_UNIT_ID });
      return;
    }

    // Web simulation
    setActiveGame("admob_loading");
    
    setTimeout(() => {
      awardAdReward();
      setLastWin(10);
      confetti({
        particleCount: 50,
        spread: 60,
        colors: ["#fbbf24", "#d97706"]
      });
      setActiveGame(null);
      toast.success(t("points_added"));
    }, 5000); 
  };

  const openOffers = () => {
    const directLink = import.meta.env.VITE_OFFERS_LINK || "https://www.cpagrip.com/view.php?id=1892642";
    
    try {
      window.open(directLink, "_blank", "noopener,noreferrer");
      addCoins(5);
      toast.success(t("offers_opened"));
    } catch (error) {
      console.error("Failed to open offers link:", error);
      toast.error(t("popup_error"));
    }
  };

  const [quizData, setQuizData] = useState({ q: "12 + 15", a: 27, options: [25, 27, 30, 22] });

  const generateQuiz = () => {
    const n1 = Math.floor(Math.random() * 50) + 1;
    const n2 = Math.floor(Math.random() * 50) + 1;
    const ans = n1 + n2;
    const opts = [ans, ans + 5, ans - 3, ans + 10].sort(() => Math.random() - 0.5);
    setQuizData({ q: `${n1} + ${n2}`, a: ans, options: opts });
    setActiveGame("quiz");
  };

  const handleWin = (amount: number) => {
    setLastWin(amount);
    addCoins(amount);
    confetti({
      particleCount: 50,
      spread: 60,
      colors: ["#a855f7", "#3b82f6"]
    });
    if (!adsDisabled) {
      setShowAd(true);
    }
    setActiveGame(null);
  };

  const doubleReward = () => {
    setActiveGame("admob_loading");
    setTimeout(() => {
      addCoins(lastWin);
      confetti({ particleCount: 150, spread: 100 });
      setShowAd(false);
      setActiveGame(null);
    }, 5000);
  };

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="text-3xl font-black mb-1">{t("earn")}</h1>
        <p className="text-gray-400 text-xs">{t("slogan")}</p>
      </header>

      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-primary/80">{t("earn")} • {t("games")}</h2>
        <div className="grid grid-cols-1 gap-4">
          {earnOptions
            .filter(opt => !(opt.id === "admob" && adsDisabled))
            .map((opt) => (
            <GlassCard 
              key={opt.id} 
              className={cn(
                "p-1 group overflow-hidden border transition-all duration-500 bg-gradient-to-br relative",
                opt.border,
                opt.gradient,
                opt.shadow
              )} 
              onClick={() => {
                if (opt.id === "admob") handleRewardedAd();
                else if (opt.id === "offers") openOffers();
                else if (opt.id === "quiz") generateQuiz();
                else setActiveGame(opt.id);
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100" />
              
              <div className="p-5 flex items-center gap-5 relative z-10">
                <div className={cn(
                  "p-4 rounded-3xl transition-all group-hover:scale-110 group-hover:rotate-6 duration-500 bg-black/20 backdrop-blur-md shadow-xl",
                  opt.color
                )}>
                  <opt.icon size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-base uppercase tracking-tight group-hover:text-white transition-colors">{t(opt.name)}</h3>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t(opt.desc)}</p>
                  
                  {opt.id === "admob" && (
                    <Button 
                      variant="primary" 
                      className="mt-3 px-4 py-1.5 text-[10px] uppercase font-black"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRewardedAd();
                      }}
                    >
                      {t("watch_ad")}
                    </Button>
                  )}
                </div>
                <div className="bg-white/10 border border-white/10 px-4 py-2 rounded-[1.5rem] flex items-center gap-2 shadow-lg backdrop-blur-md group-hover:bg-primary/20 transition-colors">
                  <CoinIcon size={16} />
                  <span className="text-accent-gold text-base font-black tracking-tighter">{opt.reward}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeGame === "admob_loading" && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[250] bg-black flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative w-20 h-20 mb-8">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary"
              />
              <PlayCircle className="absolute inset-0 m-auto text-primary animate-pulse" size={40} />
            </div>
            <h2 className="text-xl font-black mb-2">{t("loading_ad")}</h2>
            <p className="text-gray-500 text-sm mb-8">{t("wait_for_points")}</p>
            <div className="w-full max-w-[200px] h-1 bg-white/10 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: "100%" }} 
                 transition={{ duration: 5, ease: "linear" }} 
                 className="h-full bg-primary"
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAd && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6 text-white">
            <div className="text-center space-y-8 max-w-xs">
              <div className="aspect-video bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 animate-pulse">
                <PlayCircle size={64} className="text-primary" />
              </div>
              <h2 className="text-2xl font-black">{t("app_name")} - {t("ad_label")}</h2>
              <p className="text-sm text-gray-400">{t("double_reward_desc", { amount: lastWin })}</p>
              <div className="space-y-3">
                <Button variant="primary" glow className="w-full py-4 text-xs font-black uppercase" onClick={doubleReward}>
                  {t("watch_double")}
                </Button>
                <button className="text-xs text-gray-600 uppercase font-black" onClick={() => setShowAd(false)}>{t("skip_reward")}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-white/80">{t("tasks")}</h2>
          <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">{t("admin_fee")}</span>
        </div>
        
        <div className="p-4 flex items-center gap-4 bg-[#0f172a] border border-blue-500/20 rounded-[2.5rem] shadow-lg shadow-blue-500/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-50" />
          <div className="p-3 rounded-full bg-blue-500/20 text-blue-400 shadow-inner relative z-10">
            <Users size={24} />
          </div>
          <div className="flex-1 relative z-10">
            <h3 className="font-black text-xs text-white uppercase tracking-tight">{t("social_tasks")}</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-tight font-black">IG / TG / YT</p>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full shadow-lg relative z-10">
            <span className="text-white text-xs font-black">+50 {t("coins_unit")}</span>
          </div>
        </div>

        <GlassCard className="p-4 flex flex-col gap-4 border-dashed border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <div className="flex items-center gap-4 relative">
             <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
               <BadgeDollarSign size={24} />
             </div>
             <div className="flex-1">
               <h3 className="font-black text-xs text-white uppercase tracking-tight">{t("exclusive_offers_desc")}</h3>
               <p className="text-[10px] text-gray-500 uppercase tracking-tight font-black">{t("direct_link_wall")}</p>
             </div>
             <Button variant="primary" glow className="px-6 py-2 text-[10px] uppercase font-black bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" onClick={openOffers}>
               {t("exclusive_offers")}
             </Button>
          </div>
          <div className="flex items-center justify-between px-2 pt-2 border-t border-white/5">
             <div className="flex items-center gap-1">
                <CoinIcon size={12} />
                <span className="text-[10px] text-emerald-400 font-bold uppercase">{t("rewards_up_to", { amount: "5,000" })}</span>
             </div>
             <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-tighter">{t("live_offerwall")}</span>
             </div>
          </div>
        </GlassCard>
      </div>

      <AnimatePresence>
        {activeGame && activeGame !== "browser" && activeGame !== "admob_loading" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
            <GlassCard className="w-full max-w-sm p-8 relative">
              <button onClick={() => setActiveGame(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24} /></button>

              {activeGame === "spin" && (
                <div className="text-center space-y-6">
                  <h2 className="text-2xl font-black text-white">{t("spin_wheel")}</h2>
                  <div className="w-48 h-48 rounded-full border-4 border-primary/20 mx-auto flex items-center justify-center relative overflow-hidden shadow-2xl">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="absolute inset-0 bg-[conic-gradient(from_0deg,#a855f7,#3b82f6,#22c55e,#a855f7)] opacity-20" />
                    <RefreshCcw size={48} className="text-primary" />
                  </div>
                  <Button variant="primary" glow className="w-full py-4 text-xs font-black uppercase" onClick={() => handleWin(50)}>{t("spin_now")}</Button>
                </div>
              )}

              {activeGame === "scratch" && (
                <div className="text-center space-y-6">
                  <h2 className="text-2xl font-black text-white">{t("scratch_win")}</h2>
                  <div className="w-full aspect-video rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center cursor-crosshair group relative overflow-hidden shadow-2xl">
                     <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 opacity-90 group-active:opacity-0 transition-opacity duration-1000" />
                     <span className="text-3xl font-black text-yellow-500 tracking-widest">+150 {t("coins_unit")}</span>
                  </div>
                  <Button variant="primary" glow className="w-full py-4 text-xs font-black uppercase" onClick={() => handleWin(150)}>{t("claim_prize")}</Button>
                </div>
              )}

              {activeGame === "quiz" && (
                <div className="text-center space-y-6 text-white">
                  <h2 className="text-2xl font-black">{t("math_quiz")}</h2>
                  <div className="p-8 bg-black/40 rounded-3xl border border-white/5 font-mono text-3xl shadow-inner">{quizData.q} = ?</div>
                  <div className="grid grid-cols-2 gap-3">
                    {quizData.options.map(n => (
                      <Button key={n} variant="ghost" className="py-4 font-black text-white" onClick={() => n === quizData.a ? handleWin(15 * state.multiplier) : setActiveGame(null)}>{n}</Button>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white/80">{t("referral")}</h2>
        <GlassCard className="p-5 border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <Users size={24} />
             </div>
             <div className="text-white">
                <h3 className="text-sm font-black uppercase">{t("tiered_referral")}</h3>
                <p className="text-[10px] text-gray-400">{t("referral_reward_desc")}</p>
             </div>
          </div>
          <div className="bg-black/40 p-3 rounded-2xl border border-white/5 flex items-center justify-between gap-2">
             <code className="text-xs text-primary font-mono select-all">{state.referralCode || "BOY-BOUCHIBAT-2026"}</code>
             <Button variant="primary" className="py-2 px-4 text-[10px] font-black uppercase" onClick={() => {
                if (state.referralCode) navigator.clipboard.writeText(state.referralCode);
                toast.success(t("referral_copied"));
             }}>{t("copy")}</Button>
          </div>
          <p className="mt-4 text-[10px] text-center text-gray-500 italic">{t("owned_by")}</p>
        </GlassCard>
      </div>
    </div>
  );
}
