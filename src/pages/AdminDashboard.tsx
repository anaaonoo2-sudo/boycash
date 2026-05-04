/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import React, { useState, useEffect } from "react";
import GlassCard from "@/src/components/ui/GlassCard";
import Button from "@/src/components/ui/Button";
import { 
  Users, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Search,
  ArrowRight,
  Filter,
  DollarSign,
  AlertCircle,
  RefreshCcw,
  Clock
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  collection, 
  query, 
  getDocs, 
  where, 
  updateDoc, 
  doc, 
  orderBy, 
  limit,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  method: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
  transactionId: string; // Added field
  createdAt: any;
}

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'withdrawals' | 'users'>('overview');
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    totalPaid: 0
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch withdrawals
      const wQuery = query(collection(db, "withdrawals"), orderBy("createdAt", "desc"), limit(50));
      const wSnap = await getDocs(wQuery);
      const wData = wSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest));
      setRequests(wData);

      // Simple stats (in a real app, these would be separate counters or computed)
      setStats({
        totalUsers: 1250, // Mock for now until we have a users collection fully indexed
        totalWithdrawals: wData.length,
        pendingWithdrawals: wData.filter(r => r.status === 'pending').length,
        totalPaid: wData.filter(r => r.status === 'approved').reduce((acc, r) => acc + r.amount, 0)
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (req: WithdrawalRequest, newStatus: 'approved' | 'rejected') => {
    try {
      // 1. Update global withdrawal status
      await updateDoc(doc(db, "withdrawals", req.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // 2. Update user's transaction status
      if (req.transactionId) {
        await updateDoc(doc(db, "users", req.userId, "transactions", req.transactionId), {
          status: newStatus === 'approved' ? 'completed' : 'failed',
          updatedAt: serverTimestamp()
        });
      }

      // 3. If rejected, refund user balance
      if (newStatus === 'rejected') {
        const userRef = doc(db, "users", req.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
           const currentBalance = userSnap.data().balance || 0;
           await updateDoc(userRef, {
             balance: currentBalance + req.amount
           });
        }
      }

      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6 pb-24">
      <header className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Admin Control</h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em]">Management Suite</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-2xl border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase text-primary">System Live</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', icon: TrendingUp, label: 'Overview' },
          { id: 'withdrawals', icon: CreditCard, label: 'Withdrawals' },
          { id: 'users', icon: Users, label: 'Users' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[10px] font-black uppercase transition-all duration-300",
              activeTab === tab.id 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-white/40 hover:text-white/60 hover:bg-white/5"
            )}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <GlassCard className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                <Users size={20} className="text-primary mb-3" />
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Total Players</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black">{stats.totalUsers}</h3>
                  <span className="text-[8px] font-black text-accent-green">+12%</span>
                </div>
              </GlassCard>

              <GlassCard className="p-6 bg-gradient-to-br from-secondary/10 to-transparent border-secondary/20">
                <DollarSign size={20} className="text-secondary mb-3" />
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Total Payouts</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black">${stats.totalPaid}</h3>
                </div>
              </GlassCard>

              <GlassCard className="p-6 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                <Clock size={20} className="text-amber-500 mb-3" />
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Pending Orders</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black">{stats.pendingWithdrawals}</h3>
                </div>
              </GlassCard>

              <GlassCard className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                <CheckCircle size={20} className="text-blue-500 mb-3" />
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Success Rate</p>
                <div className="flex items-baseline gap-2">
                  <h1 className="text-2xl font-black">98.5%</h1>
                </div>
              </GlassCard>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40 px-2">Critical Tasks</h3>
              <GlassCard className="p-4 flex items-center justify-between border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase">Pending Payouts</h4>
                    <p className="text-[10px] text-white/40 uppercase font-black">{stats.pendingWithdrawals} requests need review</p>
                  </div>
                </div>
                <Button 
                   variant="ghost" 
                   className="p-3 text-amber-500 bg-amber-500/10" 
                   onClick={() => setActiveTab('withdrawals')}
                >
                  <ArrowRight size={18} />
                </Button>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {activeTab === 'withdrawals' && (
          <motion.div 
            key="withdrawals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-2">
               <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Request Queue</h3>
               <div className="flex items-center gap-2">
                  <button className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                     <Filter size={14} />
                  </button>
                  <button 
                    onClick={fetchData}
                    className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                  >
                     <RefreshCcw size={14} />
                  </button>
               </div>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center gap-4">
                 <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Fetching Data...</p>
              </div>
            ) : requests.length === 0 ? (
              <GlassCard className="p-12 text-center opacity-30 border-dashed border-white/10">
                 <p className="text-xs font-black uppercase tracking-widest">No requests found</p>
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <GlassCard key={req.id} className={cn(
                    "p-4 transition-all duration-300",
                    req.status === 'pending' ? "border-amber-500/20 bg-amber-500/5 ring-1 ring-amber-500/10" : "opacity-70 grayscale"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center p-2 border border-white/5 text-primary">
                             <img src={req.method === 'paypal' ? "https://img.icons8.com/fluency/144/paypal.png" : "https://img.icons8.com/color/144/binance.png"} alt="" className="w-full h-full object-contain" />
                          </div>
                          <div>
                             <h4 className="text-sm font-black uppercase tracking-tighter">{req.userName}</h4>
                             <p className="text-[9px] text-white/40 uppercase font-black">{req.userEmail}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-lg font-black text-primary">${req.amount}</p>
                          <p className="text-[8px] text-white/20 uppercase font-black">{new Date(req.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                       </div>
                    </div>

                    <div className="bg-black/20 rounded-xl p-3 mb-4 border border-white/5">
                       <p className="text-[9px] text-white/30 uppercase font-black mb-1">Payment Method: <span className="text-white/60">{req.method}</span></p>
                       <p className="text-[9px] text-white/30 uppercase font-black">Details: <span className="text-white/60">{req.details}</span></p>
                    </div>

                    {req.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                           onClick={() => handleStatusUpdate(req, 'approved')}
                           className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                        >
                           <CheckCircle size={14} />
                           Approve
                        </button>
                        <button 
                           onClick={() => handleStatusUpdate(req, 'rejected')}
                           className="flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                        >
                           <XCircle size={14} />
                           Reject
                        </button>
                      </div>
                    )}

                    {req.status !== 'pending' && (
                      <div className={cn(
                        "flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase border",
                        req.status === 'approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      )}>
                        {req.status === 'approved' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {req.status}
                      </div>
                    )}
                  </GlassCard>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'users' && (
           <motion.div 
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
               <input 
                  type="text" 
                  placeholder="SEARCH USERS (UID / EMAIL)..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-black uppercase placeholder:text-white/10 focus:outline-none focus:border-primary transition-all"
               />
            </div>

            <GlassCard className="p-8 text-center opacity-30 border-dashed border-white/10">
               <Users size={32} className="mx-auto mb-4" />
               <p className="text-xs font-black uppercase tracking-widest italic">User management suite arriving in v1.1</p>
               <p className="text-[10px] text-white/50 mt-2 uppercase font-black">Requires Indexing users collection</p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
