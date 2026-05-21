/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import GlassCard from "@/src/components/ui/GlassCard";
import Button from "@/src/components/ui/Button";
import { Send, TrendingUp, Zap, ChevronRight, Wallet, PlayCircle } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "@/src/context/AppContext";
import { useAuth } from "@/src/context/AuthContext";
import { cn } from "@/src/lib/utils";
import { useNavigate } from "react-router-dom";
import CoinIcon from "@/src/components/ui/CoinIcon";
import SuccessStories from "@/src/components/SuccessStories";
import NewsTicker from "@/src/components/ui/NewsTicker";

export default function Dashboard() {
  const { t } = useTranslation();
  const { state, claimDaily, triggerAd } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [aiInput, setAiInput] = useState("");
  const [isAdLoading, setIsAdLoading] = useState(false);

  const handleAiSearch = () => {
    if (!aiInput.trim()) return;
    navigate('/assistant', { state: { initialQuery: aiInput } });
  };
  
  return (
    <div className="space-y-6">
      <div className="h-4" /> {/* Spacer instead of header */}

      <NewsTicker />

      {/* Main Balance Card */}
      <GlassCard className="relative overflow-hidden p-10 bg-gradient-to-br from-primary/30 via-transparent to-secondary/20 border-white/20 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] group">
        {/* Animated Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-80 h-80 bg-primary/40 blur-[120px] -mr-40 -mt-40 rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/30 blur-[100px] -ml-32 -mb-32 rounded-full" 
        />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.4em] mb-1">
                {user?.displayName || "Player"}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                <h2 className="text-[10px] font-black text-accent-green uppercase tracking-widest">
                  {t("verified_account")}
                </h2>
              </div>
            </div>
            <motion.div 
              whileHover={{ rotate: 90 }}
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl"
            >
               <TrendingUp size={22} className="text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            </motion.div>
          </div>
          
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-extrabold text-white/20 tracking-tighter">$</span>
            <span className="text-8xl font-black tracking-tight text-white drop-shadow-[0_20px_60px_rgba(255,255,255,0.2)]">
              {state.balance.toFixed(2)}
            </span>
          </div>
          
          <div className="mt-12 flex gap-4">
            <div className="flex-1 flex items-center gap-4 bg-white/5 backdrop-blur-3xl py-4 px-6 rounded-[1.5rem] border border-white/10 shadow-2xl group-hover:bg-white/10 transition-all duration-700">
              <CoinIcon size={28} />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">{t("coins")}</span>
                <span className="text-xl font-black text-accent-gold drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">{state.coins.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-4 bg-white/5 backdrop-blur-3xl py-4 px-6 rounded-[1.5rem] border border-white/10 shadow-2xl group-hover:bg-white/10 transition-all duration-700 delay-100">
              <div className="p-2 rounded-xl bg-primary/20">
                <Zap size={22} className="text-primary fill-primary/30" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">{t("rank")}</span>
                <span className="text-lg font-black text-white uppercase tracking-tighter">{t("level_short")} {state.level}</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Start Tasks Call to Action */}
      <Button 
        variant="primary" 
        glow 
        onClick={() => navigate('/earn')}
        className="w-full py-6 rounded-[2rem] flex items-center justify-center gap-4 bg-gradient-to-r from-primary to-secondary group shadow-[0_20px_40px_rgba(139,92,246,0.3)] border-b-4 border-b-primary/50"
      >
        <PlayCircle size={24} className="group-hover:scale-110 transition-transform duration-500" />
        <span className="font-extrabold uppercase tracking-[0.25em] text-sm">{t("start_tasks")}</span>
      </Button>

      {/* Quick Access Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button 
          variant="primary" 
          glow 
          disabled={isAdLoading}
          onClick={() => {
            setIsAdLoading(true);
            triggerAd(() => {
              setIsAdLoading(false);
              navigate('/earn'); // Still navigate to show the reward animation
            });
          }}
          className="w-full py-6 rounded-[2rem] flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-500 to-orange-600 border-none shadow-[0_10px_30px_rgba(245,158,11,0.3)] group disabled:opacity-50"
        >
          <PlayCircle size={32} className={cn("transition-transform text-white", isAdLoading ? "animate-spin" : "group-hover:scale-110")} />
          <div className="text-center">
            <span className="block font-black uppercase tracking-[0.2em] text-[10px] text-white/80">{isAdLoading ? t("loading") : t("watch_ad_btn")}</span>
            <span className="block font-black uppercase tracking-tight text-sm text-white">{isAdLoading ? t("wait_5s") : t("earn_rewards")}</span>
          </div>
        </Button>

        <Button 
          variant="primary" 
          glow 
          onClick={() => {
            const directLink = "https://installyourfiles.com/script_include.php?id=1892642";
            window.open(directLink, "_blank", "noopener,noreferrer");
          }}
          className="w-full py-6 rounded-[2rem] flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-500 to-teal-700 border-none shadow-[0_10px_30px_rgba(16,185,129,0.3)] group"
        >
          <Zap size={32} className="group-hover:scale-110 transition-transform text-white fill-white/20" />
          <div className="text-center">
            <span className="block font-black uppercase tracking-[0.2em] text-[10px] text-white/80">{t("complete_offers_btn")}</span>
            <span className="block font-black uppercase tracking-tight text-sm text-white">{t("high_payouts")}</span>
          </div>
        </Button>
      </div>

      {/* Progress Bar */}
      <GlassCard className="p-4 py-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("min_payout")}</span>
          <span className="text-xs font-black text-white">${state.balance.toFixed(2)} / $5.00</span>
        </div>
        <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5 p-[1px]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((state.balance / 5) * 100, 100)}%` }}
            className="h-full bg-gradient-to-r from-primary via-secondary to-accent-blue rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
          />
        </div>
      </GlassCard>

      {/* Daily Streak */}
      <GlassCard className="p-5 border-l-4 border-l-primary shadow-highlight">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-500">
            <Zap size={20} className="fill-yellow-500/20" />
          </div>
          <h3 className="font-black text-sm uppercase tracking-tight">{t("daily_streak")} • {t("day")} {state.dailyStreak}</h3>
        </div>
        <div className="flex justify-between gap-1.5">
          {[10, 15, 25, 40, 55, 75, 100].map((coins, i) => (
            <div 
              key={i} 
              className={cn(
                "flex-1 aspect-[4/5] rounded-xl flex flex-col items-center justify-center border text-[10px] font-black transition-all duration-500",
                i + 1 === state.dailyStreak 
                  ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-105" 
                  : i + 1 < state.dailyStreak 
                  ? "bg-accent-green/10 border-accent-green/20 text-accent-green opacity-50"
                  : "bg-black/20 border-white/5 text-gray-600"
              )}
            >
              <span className="mb-1 opacity-60">D{i+1}</span>
              <span className="text-sm">{coins}</span>
            </div>
          ))}
        </div>
        <Button 
          variant="primary" 
          glow 
          onClick={claimDaily}
          className="w-full mt-5 py-4 text-xs font-black uppercase tracking-[0.2em]"
        >
          {t("claim")}
        </Button>
      </GlassCard>

      {/* AI Assistant Banner */}
      <GlassCard 
        className="p-6 border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-primary/10 space-y-4 group"
      >
        <div className="flex items-center justify-between cursor-pointer" onClick={() => navigate('/assistant')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg group-hover:rotate-12 transition-transform">
              <Send size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight">{t("need_help")}</h3>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{t("ask_ai")}</p>
            </div>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/10 group-hover:bg-primary transition-colors">
            <ChevronRight size={16} />
          </div>
        </div>

        <div className="relative mt-2">
          <input 
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder={t("ask_me_anything")}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAiSearch();
              }
            }}
          />
          <button 
            onClick={handleAiSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-primary transition-colors p-1"
          >
             <Send size={14} />
          </button>
        </div>
      </GlassCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard 
          className="flex flex-col items-center justify-center gap-2 py-6 rounded-[2.5rem] border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
          onClick={() => navigate('/earn')}
        >
          <div className="p-3 rounded-full bg-primary/20 text-primary">
            <Zap size={24} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">{t("earn")}</span>
        </GlassCard>
        <GlassCard 
          className="flex flex-col items-center justify-center gap-2 py-6 rounded-[2.5rem] border border-secondary/20 bg-secondary/5 hover:bg-secondary/10 transition-colors cursor-pointer"
          onClick={() => navigate('/wallet')}
        >
          <div className="p-3 rounded-full bg-secondary/20 text-secondary">
            <Wallet size={24} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">{t("wallet")}</span>
        </GlassCard>
      </div>

      {/* Success Stories / Proof of Payment */}
      <SuccessStories />
    </div>
  );
}
