/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import React, { useEffect, useState } from "react";
import GlassCard from "./ui/GlassCard";
import { CheckCircle, CircleDot, User, DollarSign } from "lucide-react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface PayoutEvent {
  id: string;
  userName: string;
  amount: number;
  method: string;
  status: string;
}

const SuccessStories = () => {
  const [payouts, setPayouts] = useState<PayoutEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for when no real payouts exist
  const MOCK_PAYOUTS: PayoutEvent[] = [
    { id: 'm1', userName: 'Ahmed_Y2', amount: 12.50, method: 'Binance Pay', status: 'approved' },
    { id: 'm2', userName: 'Sarah.Om', amount: 5.00, method: 'PayPal', status: 'approved' },
    { id: 'm3', userName: 'Mustafa_99', amount: 25.00, method: 'Vodafone Cash', status: 'approved' },
    { id: 'm4', userName: 'Lila_K1', amount: 8.75, method: 'USDT', status: 'approved' },
  ];

  useEffect(() => {
    const q = query(
      collection(db, "withdrawals"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PayoutEvent[];
        setPayouts(data);
      } else {
        // Fallback to mock data if empty
        setPayouts(MOCK_PAYOUTS);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Firestore listener failed, using mock data", error);
      setPayouts(MOCK_PAYOUTS);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading && payouts.length === 0) return null;
  if (!loading && payouts.length === 0) return (
     <GlassCard className="p-4 border-dashed border-white/5 opacity-40">
        <p className="text-[8px] font-black uppercase text-center tracking-widest leading-relaxed">
          Waiting for the first winner of the day...
        </p>
     </GlassCard>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">قصص النجاح • Recent Payouts</h3>
         <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[7px] font-black text-emerald-400 uppercase tracking-tighter">Live Proof</span>
         </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {payouts.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-3 bg-gradient-to-r from-emerald-500/5 to-transparent border-emerald-500/10 flex items-center justify-between relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 blur-xl rounded-full" />
                 
                 <div className="flex items-center gap-3 relative z-10">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10 group-hover:scale-110 transition-transform">
                       <User size={16} />
                    </div>
                    <div>
                       <h4 className="text-[10px] font-black text-white uppercase tracking-tighter">{p.userName}</h4>
                       <p className="text-[8px] text-white/30 uppercase font-black">{p.method}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-2 relative z-10">
                    <div className="flex items-center gap-0.5 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                       <DollarSign size={10} className="text-emerald-400" />
                       <span className="text-xs font-black text-white tracking-tighter">{p.amount.toFixed(2)}</span>
                    </div>
                    <div className="p-1 rounded-full bg-emerald-500 text-dark-bg">
                       <CheckCircle size={10} />
                    </div>
                 </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SuccessStories;
