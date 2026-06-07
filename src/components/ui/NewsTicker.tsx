import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Megaphone, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import GlassCard from "./GlassCard";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  createdAt: any;
}

export default function NewsTicker() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(3));
    const unsubscribe = onSnapshot(q, (snap) => {
      setAnnouncements(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
    }, (error) => {
      console.warn("NewsTicker listener failed:", error);
    });
    return () => unsubscribe();
  }, []);

  if (announcements.length === 0 || dismissed) return null;

  const current = announcements[currentIndex];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="mb-6 relative group"
      >
        <GlassCard className={`p-4 border-l-4 ${
          current.type === 'info' ? 'border-primary' : 
          current.type === 'success' ? 'border-emerald-500' :
          current.type === 'warning' ? 'border-amber-500' : 'border-rose-500'
        } bg-white/[0.03]`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl ${
              current.type === 'info' ? 'bg-primary/20 text-primary' : 
              current.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' :
              current.type === 'warning' ? 'bg-amber-500/20 text-amber-500' : 'bg-rose-500/20 text-rose-500'
            }`}>
              <Megaphone size={16} className="animate-bounce-slow" />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{current.title}</h4>
              <p className="text-xs font-bold text-white/90 leading-relaxed tracking-tight">{current.message}</p>
            </div>
            <button 
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-white/5 rounded-lg opacity-20 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}
