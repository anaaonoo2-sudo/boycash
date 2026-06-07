/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import GlassCard from "@/src/components/ui/GlassCard";
import { 
  RefreshCcw, 
  Layers, 
  Hash, 
  Globe, 
  Users, 
  X, 
  PlayCircle, 
  Lock, 
  BadgeDollarSign, 
  Youtube, 
  Send as Telegram, 
  Instagram,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/src/context/AppContext";
import { useAuth } from "@/src/context/AuthContext";
import Button from "@/src/components/ui/Button";
import confetti from "canvas-confetti";
import CoinIcon from "@/src/components/ui/CoinIcon";
import { cn } from "@/src/lib/utils";
import { toast } from "react-hot-toast";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

const platformIcons: Record<string, any> = {
  youtube: Youtube,
  telegram: Telegram,
  instagram: Instagram,
  tiktok: Globe,
};

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
  const { user } = useAuth();
  const { addCoins, awardAdReward, state, completeTask } = useApp();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [dynamicTasks, setDynamicTasks] = useState<any[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const adsDisabled = import.meta.env.VITE_DISABLE_ADS === "true";

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const tasksData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDynamicTasks(tasksData);

      if (user) {
        const completedSnap = await getDocs(collection(db, "users", user.uid, "completedTasks"));
        const completedIds = new Set(completedSnap.docs.map(doc => doc.id));
        setCompletedTaskIds(completedIds);
      }
    } catch (e) {
      console.error("Error fetching tasks:", e);
    }
  };

  const handleTaskClick = (task: any) => {
    if (completedTaskIds.has(task.id)) {
      toast.error("Already completed!");
      return;
    }
    window.open(task.link, "_blank");
    setVerifyingTaskId(task.id);
  };

  const handleVerifyTask = async (task: any) => {
    const success = await completeTask(task.id, task.reward, task.title);
    if (success) {
      setCompletedTaskIds(prev => new Set(prev).add(task.id));
      setVerifyingTaskId(null);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success(`Success! +${task.reward} coins`);
    } else {
      toast.error("Failed to verify. Try again.");
    }
  };

  const handleRewardedAd = () => {
    const anyWindow = window as any;
    const AD_UNIT_ID = import.meta.env.VITE_ADMOB_REWARDED_ID || "ca-app-pub-2691032504478251/3649519865";
    
    if (anyWindow.Android && anyWindow.Android.showRewardedAd) {
      anyWindow.Android.showRewardedAd(AD_UNIT_ID);
      return;
    }
    if (anyWindow.webkit && anyWindow.webkit.messageHandlers && anyWindow.webkit.messageHandlers.showRewardedAd) {
      anyWindow.webkit.messageHandlers.showRewardedAd.postMessage({ unitId: AD_UNIT_ID });
      return;
    }

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
    const directLink = import.meta.env.VITE_OFFERS_LINK || "https://installyourfiles.com/script_include.php?id=1892642";
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
    <div className="space-y-6 pb-24">
      <header className="px-2">
        <h1 className="text-4xl font-extrabold tracking-tighter text-white uppercase italic">{t("earn")}</h1>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-1">{t("slogan")}</p>
      </header>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-black uppercase tracking-widest text-white/40">{t("games")} • {t("exclusive")}</h2>
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping shadow-[0_0_10px_#a855f7]" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          {earnOptions
            .filter(opt => !(opt.id === "admob" && adsDisabled))
            .map((opt) => (
            <GlassCard 
              key={opt.id} 
              className={cn(
                "p-1 group overflow-hidden border border-white/5 transition-all duration-700 bg-gradient-to-br relative rounded-[2.5rem] shadow-2xl",
                opt.gradient,
              )} 
              onClick={() => {
                if (opt.id === "admob") handleRewardedAd();
                else if (opt.id === "offers") openOffers();
                else if (opt.id === "quiz") generateQuiz();
                else setActiveGame(opt.id);
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <div className="p-6 flex items-center gap-6 relative z-10">
                <div className={cn(
                  "p-5 rounded-[2rem] transition-all group-hover:scale-110 group-hover:rotate-6 duration-700 bg-black/40 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)]",
                  opt.color
                )}>
                  <opt.icon size={36} />
                </div>
              
                <div className="flex-1">
                   <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-lg uppercase tracking-tight group-hover:text-white transition-colors">{t(opt.name)}</h3>
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                   </div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{t(opt.desc)}</p>
                </div>
                <div className="bg-white/[0.04] border border-white/10 px-5 py-3 rounded-[1.75rem] flex flex-col items-center gap-0.5 shadow-2xl backdrop-blur-3xl group-hover:bg-primary group-hover:border-primary/50 transition-all duration-500">
                  <div className="flex items-center gap-2">
                    <CoinIcon size={18} />
                    <span className="text-white text-xl font-black tracking-tighter">{opt.reward}</span>
                  </div>
                  <span className="text-[8px] font-black opacity-40 uppercase tracking-widest leading-none">Coins</span>
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

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-black uppercase tracking-widest text-white/40">{t("tasks")}</h2>
          <span className="text-[9px] text-primary/60 font-black uppercase tracking-tighter">{t("admin_fee")} REBATE</span>
        </div>
        
        {dynamicTasks.length === 0 ? (
          <GlassCard className="p-10 text-center border-dashed border-white/10 opacity-40">
            <p className="text-[10px] font-black uppercase tracking-widest italic">{t("no_tasks")}</p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {dynamicTasks.map((task) => {
              const Icon = platformIcons[task.platform] || Globe;
              const isCompleted = completedTaskIds.has(task.id);
              const isVerifying = verifyingTaskId === task.id;

              return (
                <div 
                  key={task.id} 
                  className={cn(
                    "p-4 flex items-center gap-4 border rounded-[2.5rem] shadow-lg relative overflow-hidden transition-all duration-300",
                    isCompleted 
                      ? "bg-white/5 border-white/5 opacity-50 grayscale" 
                      : "bg-[#0f172a] border-blue-500/20 shadow-blue-500/5 hover:border-blue-500/40"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-full relative z-10",
                    isCompleted ? "bg-white/10 text-white/40" : "bg-blue-500/20 text-blue-400 shadow-inner"
                  )}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1 relative z-10">
                    <h3 className={cn(
                      "font-black text-xs uppercase tracking-tight",
                      isCompleted ? "text-white/40" : "text-white"
                    )}>{task.title}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-tight font-black">{task.platform}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 relative z-10">
                    {!isCompleted && !isVerifying && (
                      <Button 
                        variant="primary" 
                        className="py-2 px-6 text-[10px] font-black uppercase"
                        onClick={() => handleTaskClick(task)}
                      >
                        {t("go")}
                      </Button>
                    )}

                    {isVerifying && (
                      <Button 
                        variant="primary" 
                        className="py-2 px-6 text-[10px] font-black uppercase bg-emerald-500 shadow-emerald-500/20 animate-pulse"
                        onClick={() => handleVerifyTask(task)}
                      >
                        {t("verify")}
                      </Button>
                    )}

                    {isCompleted && (
                      <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <CheckCircle2 size={12} />
                        <span className="text-[10px] font-black uppercase">Done</span>
                      </div>
                    )}

                    {!isCompleted && (
                      <div className="bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full">
                        <span className="text-white text-[10px] font-black">+{task.reward} {t("coins_unit")}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <GlassCard className="p-4 flex flex-col gap-4 border-dashed border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-transparent mt-4">
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

      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-xs font-black uppercase tracking-widest text-white/40">{t("referral")} • {t("bonus")}</h2>
        </div>
        <GlassCard className="p-8 border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700" />
          
          <div className="flex items-center gap-5 mb-8 relative z-10">
             <div className="w-16 h-16 rounded-[2rem] bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                <Users size={32} />
             </div>
             <div className="text-white">
                <h3 className="text-lg font-black uppercase tracking-tighter leading-none">{t("tiered_referral")}</h3>
                <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-2">{t("referral_reward_desc")}</p>
             </div>
          </div>
          
          <div className="bg-black/60 backdrop-blur-2xl p-5 rounded-[2rem] border border-white/15 flex items-center justify-between gap-4 relative z-10 shadow-2xl">
             <div className="flex flex-col">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">YOUR EXCLUSIVE CODE</span>
                <code className="text-sm text-white font-black tracking-widest select-all">{state.referralCode || "BOY-BOUCHIBAT-2026"}</code>
             </div>
             <Button variant="primary" glow className="py-3 px-8 text-[10px] font-black uppercase tracking-widest" onClick={() => {
                if (state.referralCode) navigator.clipboard.writeText(state.referralCode);
                toast.success(t("referral_copied"));
             }}>{t("copy")}</Button>
          </div>
          <p className="mt-8 text-[8px] font-black uppercase tracking-[0.5em] text-center text-white/20 italic">{t("owned_by")}</p>
        </GlassCard>
      </div>
    </div>
  );
}
