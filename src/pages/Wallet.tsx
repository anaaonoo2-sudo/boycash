/* Developed & Owned by Bouchibat - bouchibattauomi@gmail.com - 2026 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight, Clock, CheckCircle2, AlertCircle, Gift, Zap, X } from "lucide-react";
import { useApp } from "@/src/context/AppContext";
import { useNavigate } from "react-router-dom";
import Button from "@/src/components/ui/Button";
import GlassCard from "@/src/components/ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";

// بطاقة بنكية واقعية مبنية بـ CSS
function BankCard({ method }: { method: any }) {
  return (
    <div style={{
      width: "100%",
      height: 90,
      borderRadius: 14,
      position: "relative",
      overflow: "hidden",
      background: method.cardGradient,
      boxShadow: `0 8px 25px ${method.shadowColor}`,
      border: `1px solid ${method.borderColor}`,
      flexShrink: 0,
    }}>
      {/* Shine overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)",
        pointerEvents: "none",
      }} />
      {/* Chip */}
      <div style={{
        position: "absolute", left: 14, top: 14,
        width: 30, height: 22,
        background: "linear-gradient(135deg, #f4d03f, #d4a017)",
        borderRadius: 4,
        boxShadow: "inset 0 0 6px rgba(0,0,0,0.4)",
      }} />
      {/* Card logo */}
      <div style={{
        position: "absolute", right: 14, top: 12,
        display: "flex", alignItems: "center",
      }}>
        {method.logoEl}
      </div>
      {/* Card number */}
      <div style={{
        position: "absolute", left: 14, bottom: 26,
        color: method.textColor, fontSize: 11,
        fontFamily: "monospace", letterSpacing: 2, opacity: 0.85,
      }}>
        •••• •••• •••• 4829
      </div>
      {/* Brand */}
      <div style={{
        position: "absolute", right: 14, bottom: 10,
        color: method.textColor, fontSize: 10, fontWeight: 700, opacity: 0.9,
      }}>
        {method.brand}
      </div>
      {/* Name */}
      <div style={{
        position: "absolute", left: 14, bottom: 10,
        color: method.textColor, fontSize: 9, opacity: 0.7, textTransform: "uppercase", letterSpacing: 1,
      }}>
        BOYCASH USER
      </div>
    </div>
  );
}

export default function Wallet() {
  const { t, i18n } = useTranslation();
  const { state, requestWithdrawal } = useApp();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<any | null>(null);
  const [payoutDetails, setPayoutDetails] = useState("");

  const methods = [
    {
      id: "paypal",
      logo: "https://img.icons8.com/fluency/144/paypal.png",
      name: t("payout_paypal"),
      type: t("digital_wallet"),
      accent: "#0070ba",
      active: true,
      cardGradient: "linear-gradient(135deg, #003087 0%, #0070ba 60%, #009cde 100%)",
      shadowColor: "rgba(0,112,186,0.35)",
      borderColor: "rgba(0,150,220,0.4)",
      textColor: "white",
      brand: "VISA",
      logoEl: <span style={{ color: "white", fontWeight: 900, fontSize: 16, letterSpacing: -1 }}>PayPal</span>,
    },
    {
      id: "binance",
      logo: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png",
      name: t("payout_binance"),
      type: t("crypto_wallet"),
      accent: "#F3BA2F",
      active: true,
      cardGradient: "linear-gradient(135deg, #0d0d0d 0%, #1a1200 60%, #2d1f00 100%)",
      shadowColor: "rgba(243,186,47,0.25)",
      borderColor: "rgba(243,186,47,0.4)",
      textColor: "#F3BA2F",
      brand: "VISA",
      logoEl: <span style={{ color: "#F3BA2F", fontWeight: 900, fontSize: 15 }}>BINANCE</span>,
    },
    {
      id: "morocco",
      logo: "https://img.icons8.com/fluency/144/bank.png",
      name: t("payout_morocco"),
      type: t("local_bank"),
      accent: "#c1272d",
      active: false,
      cardGradient: "linear-gradient(135deg, #8B0000 0%, #c1272d 40%, #006233 100%)",
      shadowColor: "rgba(193,39,45,0.3)",
      borderColor: "rgba(193,39,45,0.3)",
      textColor: "white",
      brand: "Mastercard",
      logoEl: <span style={{ fontSize: 22 }}>🇲🇦</span>,
    },
    {
      id: "sepa",
      logo: "https://img.icons8.com/fluency/144/bank-building.png",
      name: t("payout_sepa"),
      type: t("international_bank"),
      accent: "#003399",
      active: false,
      cardGradient: "linear-gradient(135deg, #001a80 0%, #003399 50%, #1a237e 100%)",
      shadowColor: "rgba(0,51,153,0.35)",
      borderColor: "rgba(0,51,153,0.4)",
      textColor: "white",
      brand: "Mastercard",
      logoEl: <span style={{ color: "white", fontWeight: 700, fontSize: 13 }}>🇪🇺 SEPA</span>,
    },
    {
      id: "cih",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/CIH_Bank_logo.svg/200px-CIH_Bank_logo.svg.png",
      name: t("payout_cih"),
      type: t("local_bank"),
      accent: "#004B9B",
      active: true,
      cardGradient: "linear-gradient(135deg, #002255 0%, #004B9B 50%, #1565C0 100%)",
      shadowColor: "rgba(0,75,155,0.35)",
      borderColor: "rgba(0,75,155,0.4)",
      textColor: "white",
      brand: "Mastercard",
      logoEl: <span style={{ color: "#ffd700", fontWeight: 900, fontSize: 18 }}>CIH</span>,
    },
    {
      id: "cashplus",
      logo: "https://img.icons8.com/fluency/144/cash.png",
      name: t("payout_cashplus"),
      type: t("money_transfer"),
      accent: "#FF6600",
      active: false,
      cardGradient: "linear-gradient(135deg, #8B0000 0%, #cc3300 40%, #FF6600 100%)",
      shadowColor: "rgba(255,102,0,0.3)",
      borderColor: "rgba(255,102,0,0.35)",
      textColor: "white",
      brand: "Mastercard",
      logoEl: <span style={{ color: "white", fontWeight: 900, fontSize: 15 }}>CASH+</span>,
    },
  ];

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
      {/* Balance */}
      <div style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%)",
        border: "1px solid rgba(168,85,247,0.2)",
        borderRadius: 20, padding: "20px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, marginBottom: 4 }}>
            {t("balance")}
          </p>
          <p style={{ color: "white", fontSize: 36, fontWeight: 900, lineHeight: 1 }}>
            ${state.balance.toFixed(2)}
          </p>
          <div style={{ marginTop: 10, width: 200, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4,
              background: "linear-gradient(90deg, #a855f7, #6366f1)",
              width: `${Math.min((state.balance / 5) * 100, 100)}%`,
              transition: "width 0.5s ease",
            }} />
          </div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, marginTop: 4, fontWeight: 600 }}>
            ${state.balance.toFixed(2)} / $5.00 {t("min_payout")}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)",
            borderRadius: 12, padding: "8px 14px", marginBottom: 8,
          }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>COINS</p>
            <p style={{ color: "#fbbf24", fontSize: 18, fontWeight: 900 }}>{state.coins.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Progress bars */}
      {[
        { label: "REWARDS UP TO 5.00 COINS", target: 5 },
        { label: "REWARDS UP TO 10.00 COINS", target: 10 },
      ].map((bar) => (
        <div key={bar.target} style={{ padding: "0 4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>{bar.label}</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700 }}>
              {Math.min(Math.round((state.balance / bar.target) * 100), 100)}%
            </span>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3,
              background: "linear-gradient(90deg, #a855f7, #6366f1)",
              width: `${Math.min((state.balance / bar.target) * 100, 100)}%`,
            }} />
          </div>
        </div>
      ))}

      {/* Add payout method */}
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16, padding: "14px 18px",
        display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#a855f7",
        }}>+</div>
        <div>
          <p style={{ color: "white", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>ADD PAYOUT METHOD</p>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, textTransform: "uppercase", letterSpacing: 1 }}>SECURE INFRASTRUCTURE GATEWAY</p>
        </div>
        <ChevronRight size={16} color="rgba(255,255,255,0.3)" style={{ marginLeft: "auto" }} />
      </div>

      {/* Withdraw Infrastructure */}
      <div>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, marginBottom: 14 }}>
          WITHDRAW INFRASTRUCTURE
        </p>
        <div className="space-y-3">
          {methods.map((method) => (
            <motion.div
              key={method.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMethod(method)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${method.borderColor}`,
                borderRadius: 16, padding: "10px 14px",
                cursor: "pointer", overflow: "hidden", position: "relative",
              }}
            >
              {/* Left: Icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `${method.accent}22`,
                border: `1px solid ${method.accent}44`,
                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
              }}>
                <img src={method.logo} alt={method.name} style={{ width: 28, height: 28, objectFit: "contain" }} />
              </div>

              {/* Middle: Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <p style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{method.name}</p>
                  {method.active && (
                    <span style={{
                      background: `${method.accent}22`, color: method.accent,
                      fontSize: 8, fontWeight: 700, padding: "2px 6px",
                      borderRadius: 4, textTransform: "uppercase", letterSpacing: 1,
                      border: `1px solid ${method.accent}44`,
                    }}>VERIFIED</span>
                  )}
                </div>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>{method.type}</p>
              </div>

              {/* Right: Mini card */}
              <div style={{ width: 110, flexShrink: 0 }}>
                <BankCard method={method} />
              </div>

              {/* Arrow */}
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* History */}
      <div>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <Clock size={12} /> HISTORY
        </p>
        {state.transactions.length === 0 ? (
          <GlassCard className="p-6 flex flex-col items-center gap-3 border-white/5">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Gift className="text-primary" size={24} />
            </div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest text-center">{t("empty_transactions")}</p>
            <p className="text-[10px] text-white/20 uppercase tracking-widest text-center">{t("empty_transactions_desc")}</p>
            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest border-white/5 mt-1" onClick={() => navigate('/earn')}>
              {t("earn_now")}
            </Button>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {state.transactions.map((tx) => (
              <GlassCard key={tx.id} className="p-4 flex items-center justify-between border-white/5 bg-white/[0.02]" animate={false}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${tx.type === 'withdraw' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                    {tx.type === 'withdraw' ? <ChevronRight className="rotate-180" size={14} /> : <CheckCircle2 size={14} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tight text-white/90">
                      {tx.type === 'withdraw' ? `${t("withdraw")}: ${tx.method}` : t("tasks") + " Reward"}
                    </p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black ${tx.type === 'withdraw' ? 'text-red-400' : 'text-green-400'}`}>
                    {tx.type === 'withdraw' ? '-' : '+'}${tx.type === 'withdraw' ? tx.amount.toFixed(2) : (tx.amount / 1000).toFixed(2)}
                  </p>
                  <span className={`text-[8px] font-black uppercase ${tx.status === 'pending' ? 'text-yellow-500' : tx.status === 'completed' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.status}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {selectedMethod && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-6"
          >
            <GlassCard className="w-full max-w-sm p-0 overflow-hidden border-white/10 shadow-2xl">
              <div style={{
                background: selectedMethod.cardGradient,
                padding: "20px 20px 16px",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div className="flex justify-between items-center mb-3">
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>{selectedMethod.type}</span>
                    <button onClick={() => setSelectedMethod(null)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "white" }}>
                      <X size={16} />
                    </button>
                  </div>
                  <BankCard method={selectedMethod} />
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">Balance</p>
                    <p className="text-3xl font-black text-primary">${state.balance.toFixed(2)}</p>
                  </div>
                  <img src={selectedMethod.logo} alt="" className="h-14 w-14 object-contain" />
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 flex items-start gap-2">
                  <AlertCircle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wider">{t("withdrawal_time_warning")}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                    {selectedMethod.id === 'binance' ? t("wallet_address_label") : t("account_id_label")}
                  </label>
                  <input
                    type="text"
                    value={payoutDetails}
                    onChange={(e) => setPayoutDetails(e.target.value)}
                    placeholder={selectedMethod.id === 'binance' ? t("wallet_address_placeholder") : t("account_details_placeholder")}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary transition-all placeholder:text-white/10"
                  />
                </div>

                {state.balance < 5 && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">
                    {t("min_payout_error", { amount: "5.00" })}
                  </div>
                )}

                <Button
                  disabled={state.balance < 5 || !payoutDetails}
                  style={{ backgroundColor: (state.balance < 5 || !payoutDetails) ? '#333' : selectedMethod.accent }}
                  className="w-full py-5 rounded-2xl text-sm font-black tracking-widest uppercase flex items-center justify-center gap-2"
                  onClick={handleWithdrawal}
                >
                  <span className="text-white">{t("process_payout")}</span>
                  <ChevronRight className="text-white" size={16} />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
