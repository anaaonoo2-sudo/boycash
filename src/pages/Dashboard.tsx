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

export default function Dashboard() {
  const { t } = useTranslation();
  const { state, claimDaily } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [aiInput, setAiInput] = useState("");

  const handleAiSearch = () => {
    if (!aiInput.trim()) return;
    navigate('/assistant', { state: { initialQuery: aiInput } });
  };
  
  return (
    <div className="space-y-6">
      <div className="h-4" /> {/* Spacer instead of header */}

      {/* Main Balance Card */}
      <GlassCard className="relative overflow-hidden p-8 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 border-white/10 group">
        {/* Animated Orbs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[80px] -mr-24 -mt-24 rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 blur-[60px] -ml-16 -mb-16 rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
              {user?.displayName || "Player"} • {t("balance")}
            </p>
            <div className="p-2 rounded-full bg-white/5 border border-white/10">
               <TrendingUp size={14} className="text-primary" />
            </div>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black text-white/50">$</span>
            <span className="text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              {state.balance.toFixed(2)}
            </span>
          </div>
          
          <div className="mt-8 flex gap-3">
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md py-2 px-5 rounded-2xl border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-500">
              <CoinIcon size={20} />
              <span className="text-sm font-black text-accent-gold">{state.coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md py-2 px-5 rounded-2xl border border-white/10 group-hover:scale-105 transition-transform duration-500 delay-75">
              <Zap size={14} className="text-primary fill-primary/20" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{state.level}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Start Tasks Call to Action */}
      <Button 
        variant="primary" 
        glow 
        onClick={() => navigate('/earn')}
        className="w-full py-5 rounded-3xl flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-secondary group"
      >
        <PlayCircle size={24} className="group-hover:scale-110 transition-transform" />
        <span className="font-black uppercase tracking-[0.25em] text-sm">{t("start_tasks")}</span>
      </Button>

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
