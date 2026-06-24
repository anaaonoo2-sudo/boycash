/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";
import { Send, Loader2, ChevronDown } from "lucide-react";
import { askAssistant } from "@/src/services/aiService";
import { useTranslation } from "react-i18next";
import { cn } from "@/src/lib/utils";
import headImg from "@/src/assets/robot-parts/robot_head_front.png";
import bodyLImg from "@/src/assets/robot-parts/robot_body_left3q.png";
import bodyRImg from "@/src/assets/robot-parts/robot_body_right3q.png";
import armLImg from "@/src/assets/robot-parts/robot_arm_left.png";
import armRImg from "@/src/assets/robot-parts/robot_arm_right.png";

interface Message { role: "user" | "model"; text: string; }

const MOODS: Record<string, { mood: string; tip: string }> = {
  "/":            { mood: "excited",  tip: "robot_tip_home" },
  "/earn":        { mood: "dancing",  tip: "robot_tip_earn" },
  "/wallet":      { mood: "thinking", tip: "robot_tip_wallet" },
  "/leaderboard": { mood: "proud",    tip: "robot_tip_leaderboard" },
  "/profile":     { mood: "waving",   tip: "robot_tip_profile" },
  "/settings":    { mood: "thinking", tip: "robot_tip_settings" },
};

const BODY_ANIM: Record<string, any> = {
  idle:     { y: [0,-4,0],                    transition: { repeat: Infinity, duration: 3,   ease: "easeInOut" } },
  excited:  { y: [0,-8,0], rotate: [-2,2,-2], transition: { repeat: Infinity, duration: 1.2 } },
  dancing:  { y: [0,-10,0], rotate: [-5,5,-5], x: [-3,3,-3], transition: { repeat: Infinity, duration: 0.8 } },
  thinking: { y: [0,-3,0], rotate: [0,3,0],   transition: { repeat: Infinity, duration: 2 } },
  proud:    { y: [0,-6,0], scale: [1,1.05,1], transition: { repeat: Infinity, duration: 1.5 } },
  waving:   { y: [0,-5,0],                    transition: { repeat: Infinity, duration: 2 } },
};
const ARM_L: Record<string, any> = {
  idle:     { rotate: [0,5,0],       transition: { repeat: Infinity, duration: 2.5 } },
  dancing:  { rotate: [-20,20,-20],  transition: { repeat: Infinity, duration: 0.6 } },
  excited:  { rotate: [-10,10,-10],  transition: { repeat: Infinity, duration: 0.8 } },
  thinking: { rotate: [0,30,0],      transition: { repeat: Infinity, duration: 2 } },
  proud:    { rotate: [-15,0,-15],   transition: { repeat: Infinity, duration: 1.5 } },
  waving:   { rotate: [-30,30,-30],  transition: { repeat: Infinity, duration: 0.5 } },
};
const ARM_R: Record<string, any> = {
  idle:     { rotate: [0,-5,0],      transition: { repeat: Infinity, duration: 2.5, delay: 0.3 } },
  dancing:  { rotate: [20,-20,20],   transition: { repeat: Infinity, duration: 0.6 } },
  excited:  { rotate: [10,-10,10],   transition: { repeat: Infinity, duration: 0.8, delay: 0.2 } },
  thinking: { rotate: [0,15,0],      transition: { repeat: Infinity, duration: 3 } },
  proud:    { rotate: [15,0,15],     transition: { repeat: Infinity, duration: 1.5 } },
  waving:   { rotate: [5,-5,5],      transition: { repeat: Infinity, duration: 2 } },
};
const HEAD_ANIM: Record<string, any> = {
  idle:     { rotate: [0,3,-3,0],    transition: { repeat: Infinity, duration: 4 } },
  dancing:  { rotate: [-8,8,-8],     transition: { repeat: Infinity, duration: 0.7 } },
  excited:  { rotate: [-5,5,-5],     transition: { repeat: Infinity, duration: 0.9 } },
  thinking: { rotate: [5,10,5],      transition: { repeat: Infinity, duration: 2.5 } },
  proud:    { scale: [1,1.08,1],     transition: { repeat: Infinity, duration: 2 } },
  waving:   { rotate: [-5,5,-5],     transition: { repeat: Infinity, duration: 1 } },
};

export default function RobotMascot() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const page = MOODS[location.pathname] || { mood: "idle", tip: "robot_tip_home" };
  const mood = page.mood;

  useEffect(() => {
    setShowTip(true);
    const timer = setTimeout(() => setShowTip(false), 4000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    if (chatOpen && messages.length === 0)
      setMessages([{ role: "model", text: t("assistant_welcome") }]);
  }, [chatOpen, messages.length, t]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (chatOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [chatOpen]);

  const handleSend = useCallback(async (custom?: string) => {
    const text = custom || input.trim();
    if (!text || isLoading) return;
    if (!custom) setInput("");
    const updated = [...messages, { role: "user", text } as Message];
    setMessages(updated);
    setIsLoading(true);
    try {
      const res = await askAssistant(text, updated.map(m => ({ role: m.role, text: m.text })));
      setMessages(prev => [...prev, { role: "model", text: res }]);
    } catch {
      setMessages(prev => [...prev, { role: "model", text: t("error_occurred") }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, t]);

  if (location.pathname === "/assistant") return null;

  return (
    <>
      {/* Robot */}
      <div className={cn("fixed z-40 select-none", isRtl ? "left-4 bottom-28" : "right-4 bottom-28")}>
        <AnimatePresence>
          {showTip && !chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              className={cn(
                "absolute bottom-full mb-2 w-44 bg-black/90 border border-primary/40 rounded-2xl px-3 py-2 text-[10px] font-bold text-white/80 shadow-xl backdrop-blur-xl leading-relaxed",
                isRtl ? "right-0 text-right" : "left-0 text-left"
              )}
            >
              {t(page.tip)}
              <div className={cn("absolute top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-primary/40", isRtl ? "right-6" : "left-6")} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          onClick={() => { setChatOpen(true); setShowTip(false); }}
          className="cursor-pointer relative w-20 h-24"
          whileTap={{ scale: 0.9 }}
        >
          <motion.div animate={BODY_ANIM[mood]} className="absolute inset-0 flex items-center justify-center">
            <motion.img src={armLImg} alt="" animate={ARM_L[mood]} style={{ originX: "100%", originY: "0%" }} className="absolute left-0 top-[45%] w-7 object-contain drop-shadow-lg" />
            <motion.img src={armRImg} alt="" animate={ARM_R[mood]} style={{ originX: "0%", originY: "0%" }} className="absolute right-0 top-[45%] w-7 object-contain drop-shadow-lg" />
            <div className="relative flex flex-col items-center">
              <motion.img src={headImg} alt="" animate={HEAD_ANIM[mood]} style={{ originX: "50%", originY: "100%" }} className="w-12 object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.6)] z-10" />
              <div className="flex -mt-1">
                <img src={bodyLImg} alt="" className="w-7 object-contain drop-shadow-lg" />
                <img src={bodyRImg} alt="" className="w-7 object-contain drop-shadow-lg" />
              </div>
            </div>
          </motion.div>
          <motion.div animate={{ scale: [1,1.3,1], opacity: [0.3,0.6,0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 rounded-full bg-primary/10 blur-xl pointer-events-none" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black animate-pulse" />
        </motion.div>
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setChatOpen(false)} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        )}
      </AnimatePresence>

      {/* Chat Drawer */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-2xl border-t border-white/10 rounded-t-[2rem] flex flex-col"
            style={{ height: "70vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <img src={headImg} alt="" className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white">{t("app_name")} AI</p>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="p-2 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
                <ChevronDown size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" dir={isRtl ? "rtl" : "ltr"}>
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-2", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  {m.role === "model" && <img src={headImg} alt="" className="w-7 h-7 object-contain shrink-0 self-end" />}
                  <div className={cn("px-4 py-2.5 rounded-2xl text-[12px] leading-relaxed max-w-[80%]", m.role === "user" ? "bg-primary text-white" : "bg-white/10 text-gray-100 border border-white/10")}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-2 items-center">
                  <img src={headImg} alt="" className="w-7 h-7 object-contain animate-pulse" />
                  <div className="bg-white/10 border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin text-primary" />
                    <span className="text-[11px] text-white/50">{t("thinking")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick buttons */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto shrink-0">
              {[t("q_withdraw"), t("q_points"), t("q_min")].map((q) => (
                <button key={q} onClick={() => handleSend(q)} className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-[10px] font-bold text-white/70 active:scale-95 shrink-0">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 pb-6 pt-2 shrink-0" dir={isRtl ? "rtl" : "ltr"}>
              <div className="flex gap-2 items-center bg-white rounded-2xl p-1.5 border border-white/20">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder={t("type_question")}
                  className={cn("flex-1 bg-transparent border-none px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none", isRtl ? "text-right" : "text-left")}
                />
                <button onClick={() => handleSend()} disabled={isLoading || !input.trim()} className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-95">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
