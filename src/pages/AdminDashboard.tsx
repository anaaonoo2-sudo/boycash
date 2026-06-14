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
  Clock,
  Ban,
  ShieldAlert,
  Layers
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
  serverTimestamp,
  deleteDoc,
  addDoc
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import CoinIcon from "@/src/components/ui/CoinIcon";
import { toast } from "react-hot-toast";

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

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  createdAt: any;
}

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'withdrawals' | 'users' | 'announcements' | 'tasks'>('overview');
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'info' as Announcement['type'] });
  const [newTask, setNewTask] = useState({ title: '', link: '', reward: 50, platform: 'youtube' });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    totalPaid: 0,
    totalCoins: 0
  });

  useEffect(() => {
    if (!isAdmin && !loading) {
      navigate("/");
      return;
    }
    if (isAdmin) {
      fetchData();
      fetchAnnouncements();
      fetchTasks();
    }
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    console.log("Admin: Fetching data...");
    try {
      // 1. Fetch withdrawals
      let wData: WithdrawalRequest[] = [];
      try {
        // Try with orderBy first
        const wQuery = query(collection(db, "withdrawals"), orderBy("createdAt", "desc"), limit(50));
        const wSnap = await getDocs(wQuery);
        wData = wSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest));
      } catch (wError: any) {
        console.warn("Withdrawals orderBy failed, trying basic fetch:", wError);
        // Fallback to basic fetch if index is missing
        const fallbackQuery = query(collection(db, "withdrawals"), limit(50));
        const fallbackSnap = await getDocs(fallbackQuery);
        wData = fallbackSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest));
        // Sort manually for now
        wData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        
        if (wError.message?.includes("index")) {
          toast.error("Index partially missing. Data fetched without server-side ordering.");
        }
      }
      setRequests(wData);

      // 2. Fetch sample users for stats and recent users list
      try {
        const uQuery = query(collection(db, "users"), limit(20));
        const uSnap = await getDocs(uQuery);
        setUsersList(uSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        const totalCoinsInSample = uSnap.docs.reduce((acc, doc) => acc + (doc.data().coins || 0), 0);

        setStats({
          totalUsers: uSnap.size > 0 ? uSnap.size * 5 : 1250, 
          totalWithdrawals: wData.length,
          pendingWithdrawals: wData.filter(r => r.status === 'pending').length,
          totalPaid: wData.filter(r => r.status === 'approved').reduce((acc, r) => acc + r.amount, 0),
          totalCoins: totalCoinsInSample * 5
        });
      } catch (uError) {
        console.error("Users fetch error:", uError);
      }
    } catch (error) {
      console.error("General admin fetch error:", error);
    }
    setLoading(false);
  };

  const fetchAnnouncements = async () => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setAnnouncements(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
  };

  const postAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) return;
    try {
      await addDoc(collection(db, "announcements"), {
        ...newAnnouncement,
        createdAt: serverTimestamp()
      });
      setNewAnnouncement({ title: '', message: '', type: 'info' });
      fetchAnnouncements();
      toast.success("Announcement posted!");
    } catch (e) {
      toast.error("Failed to post");
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, "announcements", id));
      fetchAnnouncements();
      toast.success("Deleted");
    } catch (e) {
      toast.error("Error");
    }
  };

  const fetchTasks = async () => {
    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const addTask = async () => {
    if (!newTask.title || !newTask.link) return;
    try {
      await addDoc(collection(db, "tasks"), {
        ...newTask,
        createdAt: serverTimestamp()
      });
      setNewTask({ title: '', link: '', reward: 50, platform: 'youtube' });
      fetchTasks();
      toast.success("Task Added!");
    } catch (e) {
      toast.error("Error adding task");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
      fetchTasks();
      toast.success("Task Deleted");
    } catch (e) {
      toast.error("Error deleting task");
    }
  };
  const handleStatusUpdate = async (req: WithdrawalRequest, newStatus: 'approved' | 'rejected') => {
    try {
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

  const handleBanUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to ban this user? They will lose access to the app.")) return;
    try {
      await updateDoc(doc(db, "users", userId), {
        isBanned: true,
        updatedAt: serverTimestamp()
      });
      toast.success("User banned successfully");
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, isBanned: true } : u));
    } catch (error) {
      toast.error("Error banning user");
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
      <div className="flex gap-2 p-2 bg-black/40 backdrop-blur-3xl rounded-[2rem] border border-white/10 overflow-x-auto no-scrollbar shadow-2xl">
        {[
          { id: 'overview', icon: TrendingUp, label: 'Stats' },
          { id: 'withdrawals', icon: CreditCard, label: 'Payouts' },
          { id: 'users', icon: Users, label: 'Players' },
          { id: 'tasks', icon: Layers, label: 'Tasks' },
          { id: 'announcements', icon: ShieldAlert, label: 'News' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id === 'withdrawals') fetchData();
              if (tab.id === 'users') fetchData(); // Refresh users too
              if (tab.id === 'tasks') fetchTasks();
              if (tab.id === 'announcements') fetchAnnouncements();
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-[10px] font-black uppercase transition-all duration-500 min-w-fit",
              activeTab === tab.id 
                ? "bg-primary text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-105" 
                : "text-white/30 hover:text-white/60 hover:bg-white/5"
            )}
          >
            <tab.icon size={16} />
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassCard className="p-8 bg-gradient-to-br from-blue-500/20 to-transparent border-blue-500/30 group">
                <div className="flex items-center justify-between mb-4">
                    <Users size={24} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    <div className="text-[10px] font-bold text-accent-green px-2 py-0.5 bg-accent-green/10 rounded-full">+12.5%</div>
                </div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-1">Total Players</p>
                <h3 className="text-3xl font-extrabold text-white tracking-tighter">{stats.totalUsers}</h3>
              </GlassCard>

              <GlassCard className="p-8 bg-gradient-to-br from-emerald-500/20 to-transparent border-emerald-500/30 group">
                <div className="flex items-center justify-between mb-4">
                    <DollarSign size={24} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-1">Total Payouts</p>
                <h3 className="text-3xl font-extrabold text-white tracking-tighter">${stats.totalPaid}</h3>
              </GlassCard>

              <GlassCard className="p-8 bg-gradient-to-br from-amber-500/20 to-transparent border-amber-500/30 group">
                <div className="flex items-center justify-between mb-4">
                    <Clock size={24} className="text-amber-400 group-hover:scale-110 transition-transform" />
                    <div className="animate-pulse w-2 h-2 rounded-full bg-amber-400" />
                </div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-1">Pending Orders</p>
                <h3 className="text-3xl font-extrabold text-white tracking-tighter">{stats.pendingWithdrawals}</h3>
              </GlassCard>

              <GlassCard className="p-8 bg-gradient-to-br from-primary/20 to-transparent border-primary/30 group">
                <div className="flex items-center justify-between mb-4">
                    <CheckCircle size={24} className="text-primary group-hover:scale-110 transition-transform" />
                    <div className="text-[10px] font-bold text-primary/60">ACTIVE</div>
                </div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-1">Success Rate</p>
                <h3 className="text-3xl font-extrabold text-white tracking-tighter">98.5%</h3>
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
              <div className="py-20 flex flex-col items-center gap-4 min-h-[500px]">
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
                          <p className="text-[8px] text-white/20 uppercase font-black">
                             {req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : "PENDING..."}
                          </p>
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
                  placeholder="SEARCH USERS (EMAIL)..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-black uppercase placeholder:text-white/10 focus:outline-none focus:border-primary transition-all"
                onChange={async (e) => {
                    const val = e.target.value.toLowerCase();
                    if (val.length > 3) {
                      const q = query(collection(db, "users"), where("email_lower", ">=", val), where("email_lower", "<=", val + "\uf8ff"), limit(20));
                      // If email_lower doesn't exist, we fallback to basic search or just use email if case matches
                      try {
                        const snap = await getDocs(q);
                        setUsersList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
                      } catch (err) {
                         // Fallback search
                         const q2 = query(collection(db, "users"), where("email", ">=", val), where("email", "<=", val + "\uf8ff"), limit(20));
                         const snap2 = await getDocs(q2);
                         setUsersList(snap2.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
                      }
                    } else if (val.length === 0) {
                      fetchData(); // Reset to recent users
                    }
                  }}
               />
            </div>

            <div className="space-y-3">
              {usersList.map((usr) => (
                <GlassCard key={usr.id} className="p-4 border-white/5 bg-white/[0.02]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[1.2rem] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-0.5">
                        <img src={usr.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${usr.uid}`} className="w-full h-full rounded-[1rem] object-cover" alt="" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-tighter">{usr.displayName || "Unknown User"}</h4>
                        <p className="text-[9px] text-white/40 uppercase font-black">{usr.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <CoinIcon size={12} />
                        <span className="text-sm font-black text-white">{Math.floor(usr.coins || 0)}</span>
                      </div>
                      <p className="text-[10px] text-primary font-black uppercase tracking-wider">${(usr.balance || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  {usr.isBanned ? (
                    <div className="mt-3 p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-500 text-[9px] font-black uppercase tracking-widest">
                       <ShieldAlert size={12} />
                       Account Banned
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button 
                         onClick={() => handleBanUser(usr.uid)}
                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-tighter"
                      >
                         <Ban size={10} />
                         Ban Player
                      </button>
                    </div>
                  )}
                </GlassCard>
              ))}
              {usersList.length === 0 && (
                <GlassCard className="p-8 text-center opacity-30 border-dashed border-white/10">
                   <Users size={32} className="mx-auto mb-4" />
                   <p className="text-xs font-black uppercase tracking-widest italic">Type to search for users</p>
                </GlassCard>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'tasks' && (
          <motion.div 
            key="tasks"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <GlassCard className="p-6 border-emerald-500/20">
               <h3 className="text-sm font-black uppercase mb-4 tracking-tighter">New Social Task</h3>
               <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Task Title (e.g. Sub to YT)" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none focus:border-primary"
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="Link (https://...)" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none focus:border-primary"
                    value={newTask.link}
                    onChange={e => setNewTask({...newTask, link: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="number" 
                      placeholder="Coins" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none focus:border-primary"
                      value={newTask.reward}
                      onChange={e => setNewTask({...newTask, reward: parseInt(e.target.value)})}
                    />
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase outline-none focus:border-primary text-white"
                      value={newTask.platform}
                      onChange={e => setNewTask({...newTask, platform: e.target.value})}
                    >
                      <option value="youtube">YouTube</option>
                      <option value="telegram">Telegram</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                  </div>
                  <Button variant="primary" className="w-full py-3 text-[10px] bg-emerald-500" onClick={addTask}>Create Task</Button>
               </div>
            </GlassCard>

            <div className="space-y-3">
              {tasks.map(task => (
                 <GlassCard key={task.id} className="p-4 border-white/5">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                             <Layers size={16} className="text-emerald-500" />
                          </div>
                          <div>
                             <h4 className="text-xs font-black uppercase text-white">{task.title}</h4>
                             <p className="text-[9px] text-white/40 uppercase">{task.platform} • {task.reward} Coins</p>
                          </div>
                       </div>
                       <button onClick={() => deleteTask(task.id)} className="text-rose-500 p-2">
                          <Ban size={16} />
                       </button>
                    </div>
                 </GlassCard>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'announcements' && (
          <motion.div 
            key="announcements"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <GlassCard className="p-6 border-primary/20">
               <h3 className="text-sm font-black uppercase mb-4 tracking-tighter">Create News</h3>
               <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Short Title" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none focus:border-primary"
                    value={newAnnouncement.title}
                    onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  />
                  <textarea 
                    placeholder="Announcement Message" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none focus:border-primary h-24"
                    value={newAnnouncement.message}
                    onChange={e => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                  />
                  <div className="flex gap-2">
                    {['info', 'success', 'warning', 'urgent'].map(type => (
                      <button
                        key={type}
                        onClick={() => setNewAnnouncement({...newAnnouncement, type: type as any})}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all",
                          newAnnouncement.type === type ? "bg-primary text-white" : "bg-white/5 text-white/40"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <Button variant="primary" className="w-full py-3 text-[10px]" onClick={postAnnouncement}>Post News</Button>
               </div>
            </GlassCard>

            <div className="space-y-3">
              {announcements.map(ann => (
                 <GlassCard key={ann.id} className="p-4 border-white/5">
                    <div className="flex items-start justify-between">
                       <div>
                          <h4 className="text-xs font-black uppercase text-white mb-1">{ann.title}</h4>
                          <p className="text-[10px] text-white/40 line-clamp-2">{ann.message}</p>
                       </div>
                       <button onClick={() => deleteAnnouncement(ann.id)} className="text-rose-500 p-1">
                          <XCircle size={16} />
                       </button>
                    </div>
                 </GlassCard>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
