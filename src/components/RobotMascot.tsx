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

// مواضع الروبوت حسب الصفحة
const PAGE_POS: Record<string, { x: number; y: number }> = {
  "/":            { x: 16, y: 120 },
  "/earn":        { x: 16, y: 200 },
  "/wallet":      { x: 16, y: 160 },
  "/leaderboard": { x: 16, y: 140 },
  "/profile":     { x: 16, y: 180 },
  "/settings":    { x: 16, y: 150 },
};

const BODY_ANIM: Record<string, any> = {
  idle:     { y: [0,-4,0],                     transition: { repeat: Infinity, duration: 3,   ease: "easeInOut" } },
  excited:  { y: [0,-8,0], rotate: [-2,2,-2],  transition: { repeat: Infinity, duration: 1.2 } },
  dancing:  { y: [0,-10,0], rotate: [-5,5,-5], transition: { repeat: Infinity, duration: 0.8 } },
  thinking: { y: [0,-3,0], rotate: [0,3,0],    transition: { repeat: Infinity, duration: 2 } },
  proud:    { y: [0,-6,0], scale: [1,1.05,1],  transition: { repeat: Infinity, duration: 1.5 } },
  waving:   { y: [0,-5,0],                     transition: { repeat: Infinity, duration: 2 } },
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
  idle:     { rotate: [0,-5,0],     transition: { repeat: Infinity, duration: 2.5, delay: 0.3 } },
  dancing:  { rotate: [20,-20,20],  transition: { repeat: Infinity, duration: 0.6 } },
  excited:  { rotate: [10,-10,10],  transition: { repeat: Infinity, duration: 0.8, delay: 0.2 } },
  thinking: { rotate: [0,15,0],     transition: { repeat: Infinity, duration: 3 } },
  proud:    { rotate: [15,0,15],    transition: { repeat: Infinity, duration: 1.5 } },
  waving:   { rotate: [5,-5,5],     transition: { repeat: Infinity, duration: 2 } },
};
const HEAD_ANIM: Record<string, any> = {
  idle:     { rotate: [0,3,-3,0],  transition: { repeat: Infinity, duration: 4 } },
  dancing:  { rotate: [-8,8,-8],   transition: { repeat: Infinity, duration: 0.7 } },
  excited:  { rotate: [-5,5,-5],   transition: { repeat: Infinity, duration: 0.9 } },
  thinking: { rotate: [5,10,5],    transition: { repeat: Infinity, duration: 2.5 } },
  proud:    { scale: [1,1.08,1],   transition: { repeat: Infinity, duration: 2 } },
  waving:   { rotate: [-5,5,-5],   transition: { repeat: Infinity, duration: 1 } },
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
  const [kbHeight, setKbHeight] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const page = MOODS[location.pathname] || { mood: "idle", tip: "robot_tip_home" };
  const mood = page.mood;
  const targetPos = PAGE_POS[location.pathname] || { x: 16, y: 120 };

  // كشف الكيبورد عبر visualViewport
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const diff = window.innerHeight - vv.height;
      setKbHeight(diff > 100 ? diff : 0);
    };
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

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
    if (chatOpen) setTimeout(() => inputRef.current?.focus(), 350);
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

  // ارتفاع الدراور يتكيف مع الكيبورد
  const drawerBottom = kbHeight;
  const drawerHeight = kbHeight > 0 ? `calc(85vh - ${kbHeight}px)` : "70vh";

  return (
    <>
      {/* الروبوت - يتحرك حسب الصفحة */}
      <motion.div
        animate={{ x: 0, y: 0 }}
        style={{ position: "fixed", bottom: targetPos.y, right: isRtl ? "auto" : targetPos.x, left: isRtl ? targetPos.x : "auto", zIndex: 40 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="select-none"
      >
        <AnimatePresence>
          {showTip && !chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              className={cn(
                "absolute bottom-full mb-2 w-40 bg-black/90 border border-primary/40 rounded-2xl px-3 py-2 text-[10px] font-bold text-white/80 shadow-xl backdrop-blur-xl leading-relaxed",
                isRtl ? "right-0 text-right" : "left-0 text-left"
              )}
            >
              {t(page.tip)}
              <div className={cn("absolute top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-primary/40", isRtl ? "right-5" : "left-5")} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          onClick={() => { setChatOpen(true); setShowTip(false); }}
          className="cursor-pointer relative"
          style={{ width: 52, height: 72 }}
          whileTap={{ scale: 0.88 }}
        >
          <motion.div animate={BODY_ANIM[mood]} className="absolute inset-0 flex items-center justify-center">
            {/* ذراع يسار */}
            <motion.img
              src={armLImg} alt=""
              animate={ARM_L[mood]}
              style={{ originX: "90%", originY: "20%", position: "absolute", left: -10, top: "48%", width: 18 }}
              className="object-contain drop-shadow-md"
            />
            {/* ذراع يمين */}
            <motion.img
              src={armRImg} alt=""
              animate={ARM_R[mood]}
              style={{ originX: "10%", originY: "20%", position: "absolute", right: -10, top: "48%", width: 18 }}
              className="object-contain drop-shadow-md"
            />
            {/* الجسم والرأس */}
            <div className="flex flex-col items-center">
              <motion.img
                src={headImg} alt=""
                animate={HEAD_ANIM[mood]}
                style={{ originX: "50%", originY: "100%", width: 30 }}
                className="object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.7)] z-10"
              />
              <div className="flex" style={{ marginTop: -2 }}>
                <img src={bodyLImg} alt="" style={{ width: 16 }} className="object-contain" />
                <img src={bodyRImg} alt="" style={{ width: 16 }} className="object-contain" />
              </div>
            </div>
          </motion.div>

          {/* توهج */}
          <motion.div
            animate={{ scale: [1,1.4,1], opacity: [0.2,0.5,0.2] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="absolute inset-0 rounded-full bg-primary/15 blur-lg pointer-events-none"
          />
          {/* نقطة خضراء */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-black animate-pulse" />
        </motion.div>
      </motion.div>

      {/* Backdrop */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setChatOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Chat Drawer - يرتفع مع الكيبورد */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            style={{ bottom: drawerBottom, height: drawerHeight }}
            className="fixed inset-x-0 z-50 bg-[#09090f] border-t border-white/10 rounded-t-[2rem] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <img src={headImg} alt="" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-white">{t("app_name")} AI</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-2 rounded-2xl bg-white/5 border border-white/10 text-gray-400 active:scale-90 transition-transform"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 overscroll-contain"
              dir={isRtl ? "rtl" : "ltr"}
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-2 items-end", m.role === "user" ? "flex-row-reverse" : "flex-row")}
                >
                  {m.role === "model" && (
                    <img src={headImg} alt="" className="w-6 h-6 object-contain shrink-0" />
                  )}
                  <div className={cn(
                    "px-3 py-2 rounded-2xl text-[12px] leading-relaxed break-words",
                    m.role === "user"
                      ? "bg-primary text-white max-w-[75%]"
                      : "bg-white/10 text-gray-100 border border-white/10 max-w-[80%]"
                  )}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-2 items-end">
                  <img src={headImg} alt="" className="w-6 h-6 object-contain animate-pulse" />
                  <div className="bg-white/10 border border-white/10 px-3 py-2 rounded-2xl flex items-center gap-2">
                    <Loader2 size={11} className="animate-spin text-primary" />
                    <span className="text-[10px] text-white/50">{t("thinking")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick buttons */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto shrink-0 border-t border-white/5">
              {[t("q_withdraw"), t("q_points"), t("q_min")].map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white/8 border border-white/10 text-[10px] font-bold text-white/60 active:scale-95 shrink-0 transition-transform"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 pt-2 pb-4 shrink-0" dir={isRtl ? "rtl" : "ltr"}>
              <div className="flex gap-2 items-center bg-white rounded-2xl px-2 py-1.5 shadow-lg">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder={t("type_question")}
                  className={cn(
                    "flex-1 bg-transparent border-none px-2 py-2 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none",
                    isRtl ? "text-right" : "text-left"
                  )}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-90 transition-transform"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
