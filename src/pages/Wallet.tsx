/* Developed & Owned by Bouchibat - bouchibattauomi@gmail.com - 2026 */
import cardPaypal from "@/src/assets/cards/card_paypal.png";
import cardBinance from "@/src/assets/cards/card_binance.png";
import cardMorocco from "@/src/assets/cards/card_morocco.png";
import cardSepa from "@/src/assets/cards/card_sepa.png";
import cardCih from "@/src/assets/cards/card_cih.png";
import cardGoogleplay from "@/src/assets/cards/card_googleplay.png";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import GlassCard from "@/src/components/ui/GlassCard";
import { ChevronRight, Clock, CheckCircle2, AlertCircle, History, Plus, X, CreditCard, Globe, Gift, Zap, User } from "lucide-react";
import { useApp } from "@/src/context/AppContext";
import { useNavigate } from "react-router-dom";
import Button from "@/src/components/ui/Button";
import { motion, AnimatePresence } from "motion/react";
import CoinIcon from "@/src/components/ui/CoinIcon";
import { cn } from "@/src/lib/utils";
import toast from "react-hot-toast";

export default function Wallet() {
  const { t, i18n } = useTranslation();
  const { state, requestWithdrawal } = useApp();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<any | null>(null);
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [newMethod, setNewMethod] = useState({ name: "", number: "", country: "" });

  const [methods, setMethods] = useState<any[]>([
    { 
      id: "paypal",
      logo: "https://img.icons8.com/fluency/144/paypal.png", 
      name: t("payout_paypal"), 
      type: t("digital_wallet"),
      color: "from-[#003087] via-[#0070ba] to-[#009cde]",
      card1: "#003087", card2: "#009cde", cardLabel: "PayPal", cardImg: cardPaypal, network: "visa", accent: "#0070ba",
      glow: "shadow-[0_0_50px_rgba(0,112,186,0.2)]",
      active: true,
      border: "border-[#0070ba]/30"
    },
    { 
      id: "binance",
      logo: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png", 
      name: t("payout_binance"), 
      type: t("crypto_wallet"),
      color: "from-[#F3BA2F] via-[#b68c22] to-black",
      card1: "#1a1200", card2: "#2d1f00", cardLabel: "BINANCE", cardImg: cardBinance, network: "visa", accent: "#F3BA2F",
      glow: "shadow-[0_0_50px_rgba(243,186,47,0.15)]",
      active: true,
      border: "border-[#F3BA2F]/30"
    },
    { 
      id: "morocco",
      logo: "https://img.icons8.com/fluency/144/bank.png", 
      name: t("payout_morocco"), 
      type: t("local_bank"),
      color: "from-red-600 via-red-900 to-green-900",
      card1: "#8B0000", card2: "#006233", cardLabel: "MAROC", cardImg: cardMorocco, network: "mc", mc1: "#c1272d", mc2: "#f79e1b", accent: "#c1272d",
      glow: "shadow-[0_0_50px_rgba(193,39,45,0.15)]",
      active: false,
      border: "border-red-500/20"
    },
    { 
      id: "sepa",
      logo: "https://img.icons8.com/fluency/144/bank-building.png", 
      name: t("payout_sepa"), 
      type: t("international_bank"),
      color: "from-blue-900 via-indigo-950 to-blue-950",
      card1: "#003399", card2: "#001a66", cardLabel: "SEPA EU", cardImg: cardSepa, network: "mc", mc1: "#003399", mc2: "#4466cc", accent: "#003399",
      glow: "shadow-[0_0_50px_rgba(0,51,153,0.15)]",
      active: false,
      border: "border-blue-400/20"
    },
    { 
      id: "cih",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/CIH_Bank_logo.svg/200px-CIH_Bank_logo.svg.png", 
      name: t("payout_cih"), 
      type: t("local_bank"),
      color: "from-[#004B9B] via-[#00346b] to-black",
      card1: "#004B9B", card2: "#00346b", cardLabel: "CIH", cardImg: cardCih, network: "mc", mc1: "#004B9B", mc2: "#ffd700", accent: "#004B9B",
      glow: "shadow-[0_0_50px_rgba(0,75,155,0.2)]",
      active: true,
      border: "border-[#004B9B]/40"
    },
    { 
      id: "cashplus",
      logo: "https://img.icons8.com/fluency/144/cash.png", 
      name: t("payout_cashplus"), 
      type: t("money_transfer"),
      color: "from-orange-500 via-orange-800 to-red-900",
      card1: "#c8102e", card2: "#ff6600", cardLabel: "CASH+", cardImg: cardGoogleplay, network: "mc", mc1: "#c8102e", mc2: "#ff6600", accent: "#FF6600",
      glow: "shadow-[0_0_50px_rgba(255,102,0,0.15)]",
      active: false,
      border: "border-orange-500/30"
    },
  ]);

  const handleAddCard = () => {
    if (!newMethod.name || !newMethod.number) {
      toast.error(i18n.language === 'ar' ? "يرجى ملء الحقول المطلوبة" : "Please fill required fields");
      return;
    }
    
    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      logo: "https://img.icons8.com/fluency/144/visa.png",
      name: newMethod.name,
      type: `${newMethod.country || (i18n.language === 'ar' ? 'عالمي' : 'Global')} Card`,
      color: "from-gray-700 via-gray-900 to-black",
      accent: "#ffffff",
      glow: "shadow-[0_0_40px_rgba(255,255,255,0.1)]",
      active: true,
      custom: true
    };

    setMethods([...methods, newEntry]);
    setIsAddingMethod(false);
    setNewMethod({ name: "", number: "", country: "" });
    toast.success(t("payout_method_saved"));
  };

  const [payoutDetails, setPayoutDetails] = useState("");

  const handleWithdrawal = async () => {
    if (!payoutDetails) return;
    const success = await requestWithdrawal(state.balance, selectedMethod.name, payoutDetails);
    if (success) {
      setSelectedMethod(null);
      setPayoutDetails("");
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold neon-text-blue uppercase tracking-tight">{t("wallet")}</h1>
      </header>

      <GlassCard className="relative overflow-hidden p-10 bg-gradient-to-tr from-secondary/30 via-transparent to-primary/30 border-white/20 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] mb-8">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-0 w-80 h-80 bg-secondary/30 blur-[130px] -ml-40 -mt-40 rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-0 right-0 w-64 h-64 bg-primary/30 blur-[110px] -mr-32 -mb-32 rounded-full" 
        />
        
        <div className="text-center relative z-10">
          <p className="text-[11px] font-bold text-white/40 mb-3 uppercase tracking-[0.5em]">{t("total_assets")}</p>
          <h2 className="text-6xl sm:text-7xl font-black text-white drop-shadow-[0_20px_60px_rgba(255,255,255,0.2)] mb-8 tracking-tighter">
            <span className="text-3xl font-normal opacity-30 mr-1">$</span>
            {state.balance.toFixed(2)}
          </h2>
          
          <div className="w-full h-14 bg-white/[0.04] backdrop-blur-3xl border border-white/10 rounded-[1.5rem] flex items-center px-6 gap-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group transition-all duration-500 hover:bg-white/[0.08]">
            <CoinIcon size={24} />
            <div className="flex-1 flex flex-col items-start translate-y-0.5">
               <span className="text-[8px] font-black text-white/30 uppercase tracking-widest leading-none mb-0.5">{t("coins")} AVAILABLE</span>
               <span className="text-xl font-bold text-accent-gold drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]">{state.coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                 <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-none">Live</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-6 pt-2">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-black text-white/40 uppercase tracking-widest">
            <span className="font-bold">{t("rewards_up_to", { amount: "5.00" })}</span>
            <span className="text-white">{Math.min((state.balance / 5) * 100, 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((state.balance / 5) * 100, 100)}%` }}
              className="h-full bg-gradient-to-r from-blue-500 via-primary to-purple-600 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.3)]" 
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-black text-white/40 uppercase tracking-widest">
            <span className="font-bold">{t("rewards_up_to", { amount: "10.00" })}</span>
            <span className="text-white">{Math.min((state.balance / 10) * 100, 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((state.balance / 10) * 100, 100)}%` }}
              className="h-full bg-gradient-to-r from-primary via-purple-600 to-pink-600 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
            />
          </div>
        </div>
      </div>

      {/* Add New Payout Method Section */}
      <div className="space-y-4">
        <button 
          onClick={() => setIsAddingMethod(!isAddingMethod)}
          className="w-full p-6 rounded-[2.5rem] bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 flex items-center justify-between group hover:bg-primary/20 transition-all shadow-lg shadow-primary/5"
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner ${isAddingMethod ? 'bg-primary text-white rotate-90' : 'bg-primary/10 text-primary'}`}>
              <Plus size={24} />
            </div>
            <div className="text-left">
              <span className="block text-xs font-black uppercase tracking-widest text-white/90">{t("add_payout_method")}</span>
              <p className="text-[9px] text-primary/60 font-bold uppercase tracking-tighter mt-0.5">{t("secure_gateway_desc")}</p>
            </div>
          </div>
          <ChevronRight size={18} className={`text-primary/40 transition-transform duration-500 ${isAddingMethod ? 'rotate-90' : ''}`} />
        </button>

        <AnimatePresence>
          {isAddingMethod && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <GlassCard className="p-8 space-y-6 border-primary/20 bg-primary/5 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2 flex items-center gap-2">
                      <User size={12} className="text-primary" /> {t("payout_name")}
                    </label>
                    <input 
                      type="text"
                      value={newMethod.name}
                      onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                      placeholder="e.g. JOHN DOE"
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:bg-black/60 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2 flex items-center gap-2">
                        <CreditCard size={12} className="text-primary" /> {t("payout_number")}
                      </label>
                      <input 
                        type="text"
                        value={newMethod.number}
                        onChange={(e) => setNewMethod({ ...newMethod, number: e.target.value })}
                        placeholder="ID / WALLET ADDRESS"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:bg-black/60 transition-all"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2 flex items-center gap-2">
                        <Globe size={12} className="text-primary" /> {t("payout_country")}
                      </label>
                      <input 
                        type="text"
                        value={newMethod.country}
                        onChange={(e) => setNewMethod({ ...newMethod, country: e.target.value })}
                        placeholder="MOROCCO / USA / GLOBAL"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:bg-black/60 transition-all"
                      />
                    </div>
                  </div>

                  <Button 
                    variant="primary" 
                    glow 
                    className="w-full py-5 text-xs font-black uppercase mt-4 shadow-xl shadow-primary/20"
                    onClick={handleAddCard}
                  >
                    {t("save_method")}
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-4 pt-6">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/30 px-1">{t("withdraw")} Infrastructure</h3>
        <div className="flex flex-col gap-4 px-1">
          {methods.map((m, i) => (
            <motion.div
              key={i}
              whileHover={{ x: 5, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="group"
            >
              <div
                className={cn("relative h-[72px] w-full rounded-2xl overflow-hidden flex items-center cursor-pointer", m.glow)}
                style={{ background: `linear-gradient(135deg, ${m.card1} 0%, ${m.card2} 100%)`, border: "1px solid rgba(255,255,255,0.1)" }}
                onClick={() => setSelectedMethod(m)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                {/* Dynamic Brand Background Glow */}
                <div className={cn(
                  "absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-1000 bg-gradient-to-br",
                  m.color
                )} />

                {/* Enhanced Reflective Shine Effect */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
                  <div className="absolute inset-[-200%] bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-[35deg] animate-glint" style={{ animationDuration: '3s' }} />
                </div>

                {/* الجزء الأيسر — لوجو + معلومات */}
                <div className="flex items-center gap-3 px-4 z-10 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center p-2 flex-shrink-0 shadow-lg">
                    <img src={m.logo} alt="" className="w-full h-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-bold tracking-tight leading-none"
                        style={{ color: m.id === "binance" ? "#F3BA2F" : "white" }}
                      >{m.name}</span>
                      {m.active && (
                        <div className="bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-400/30 flex-shrink-0">
                          <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">✓ VERIFIED</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{m.type}</p>
                  </div>
                </div>

                {/* الجزء الأيمن — صورة البطاقة الحقيقية */}
                <div className="flex-shrink-0 pr-3 z-10">
                  <div className="relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.8)]"
                    style={{ width: 130, height: 58, borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)" }}>
                    <img src={m.cardImg} alt="" className="w-full h-full object-cover" style={{ borderRadius: 12 }} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" style={{ borderRadius: 12 }} />
                  </div>
                </div>

                {/* خط ملون أسفل */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(to right, ${m.accent}, transparent)` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-8">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white/80">
          <History size={16} />
          <h3>{t("history")}</h3>
        </div>
        
        <div className="space-y-3">
          {state.transactions.length === 0 ? (
            <GlassCard className="p-10 flex flex-col items-center text-center space-y-4 border-dashed border-white/10 bg-white/[0.01]">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border border-white/5 relative z-10">
                  <Gift className="text-primary animate-bounce-slow" size={32} />
                </div>
                <div className="absolute -top-1 -right-1">
                   <div className="w-4 h-4 rounded-full bg-accent-gold flex items-center justify-center border border-dark-bg animate-pulse">
                      <Zap size={8} className="text-black" />
                   </div>
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black uppercase tracking-tight text-white/80">{t("empty_transactions")}</h4>
                <p className="text-[10px] text-white/40 uppercase tracking-widest max-w-[200px] leading-relaxed">
                  {t("empty_transactions_desc")}
                </p>
              </div>
              <Button 
                variant="ghost" 
                className="text-[10px] font-black uppercase tracking-[0.2em] border-white/5 hover:bg-white/5 mt-2"
                onClick={() => navigate('/earn')}
              >
                {t("earn_now")}
              </Button>
            </GlassCard>
          ) : (
            state.transactions.map((tx) => (
              <GlassCard key={tx.id} className="p-4 flex items-center justify-between border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors" animate={false}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    tx.type === 'withdraw' 
                      ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                      : 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                  }`}>
                    {tx.type === 'withdraw' ? <ChevronRight className="rotate-180" size={16} /> : <CheckCircle2 size={16} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tight text-white/90">
                      {tx.type === 'withdraw' ? `${t("withdraw")}: ${tx.method}` : t("tasks") + " Reward"}
                    </p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">{new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-xs font-black ${tx.type === 'withdraw' ? 'text-red-400' : 'text-green-400'}`}>
                    {tx.type === 'withdraw' ? '-' : '+'}${tx.type === 'withdraw' ? tx.amount.toFixed(2) : (tx.amount / 1000).toFixed(2)}
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    {tx.status === 'pending' && <Clock size={8} className="text-yellow-500 animate-pulse" />}
                    <span className={`text-[8px] font-black uppercase ${
                      tx.status === 'pending' ? 'text-yellow-500' : 
                      tx.status === 'completed' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {selectedMethod && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-dark-bg/95 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <GlassCard className={`w-full max-w-sm p-0 space-y-0 border-white/10 shadow-2xl relative overflow-hidden bg-gradient-to-b ${selectedMethod.color.split(' ')[0]}/20`}>
              {/* Header with Brand Gradient */}
              <div className={`h-32 bg-gradient-to-br ${selectedMethod.color} p-8 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-[-100%] bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-[35deg] animate-glint" />
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-center text-white/80">
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase">{selectedMethod.type}</span>
                      <button onClick={() => setSelectedMethod(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-white tracking-tight">{selectedMethod.name}</h3>
                    </div>
                  </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between px-1">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] leading-none">Account Balance</p>
                    <p className="text-3xl font-bold text-primary tracking-tight">${state.balance.toFixed(2)}</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-center justify-center shadow-inner">
                    <img src={selectedMethod.logo} alt="" className="h-16 w-auto object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle size={16} className="text-accent-gold mt-0.5 shrink-0" />
                    <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wider">
                      {t("withdrawal_time_warning")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">
                      {selectedMethod.id === 'binance' ? t("wallet_address_label") : t("account_id_label")}
                    </label>
                    <input 
                      type="text"
                      value={payoutDetails}
                      onChange={(e) => setPayoutDetails(e.target.value)}
                      placeholder={selectedMethod.id === 'binance' ? t("wallet_address_placeholder") : t("account_details_placeholder")}
                      className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>

                {state.balance < 5 ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">
                    {t("min_payout_error", { amount: "5.00" })}
                  </div>
                ) : (
                  <p className="text-[8px] text-white/20 uppercase font-black text-center tracking-widest animate-pulse">Ready for secure transfer</p>
                )}

                <Button 
                  disabled={state.balance < 5 || !payoutDetails}
                  style={{ backgroundColor: (state.balance < 5 || !payoutDetails) ? '#333' : selectedMethod.accent }}
                  className="w-full py-6 rounded-2xl text-base font-black tracking-widest uppercase flex items-center justify-center gap-3 group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
                  onClick={handleWithdrawal}
                >
                  <span className="relative z-10 text-white">{t("process_payout")}</span>
                  <ChevronRight className="relative z-10 group-hover:translate-x-1 transition-transform text-white" />
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-glint" />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center opacity-30 py-8 border-t border-white/5 mt-8">
        <p className="text-[8px] font-black tracking-[0.5em] uppercase text-gray-300 italic">
          BOUCHIBAT
        </p>
        <p className="text-[6px] text-white/20 mt-1 uppercase tracking-widest leading-loose">{t("owned_by")} • 2026</p>
      </div>
    </div>
  );
}
