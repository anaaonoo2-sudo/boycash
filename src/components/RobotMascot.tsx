/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";
import { Send, Loader2, ChevronDown } from "lucide-react";
import { askAssistant } from "@/src/services/aiService";
import { useTranslation } from "react-i18next";
import { cn } from "@/src/lib/utils";
import headImg   from "@/src/assets/robot-parts/robot_head_front.png";
import bodyLImg  from "@/src/assets/robot-parts/robot_body_left3q.png";
import bodyRImg  from "@/src/assets/robot-parts/robot_body_right3q.png";
import armLImg   from "@/src/assets/robot-parts/robot_arm_left.png";
import armRImg   from "@/src/assets/robot-parts/robot_arm_right.png";

interface Message { role: "user" | "model"; text: string; }

// أبعاد الروبوت — head:28x36 | body:14x47 | arm:20x8
const H = { head: { w: 28, h: 36 }, body: { w: 14, h: 47 }, arm: { w: 20, h: 8 } };

// مواضع الروبوت تتغير حسب الصفحة (right, bottom بالـ px)
const PAGE_MOODS: Record<string, { mood: string; tip: string; rx: number; ry: number }> = {
  "/":            { mood: "excited",  tip: "robot_tip_home",        rx: 14, ry: 110 },
  "/earn":        { mood: "dancing",  tip: "robot_tip_earn",        rx: 14, ry: 300 },
  "/wallet":      { mood: "thinking", tip: "robot_tip_wallet",      rx: 14, ry: 200 },
  "/leaderboard": { mood: "proud",    tip: "robot_tip_leaderboard", rx: 14, ry: 160 },
  "/profile":     { mood: "waving",   tip: "robot_tip_profile",     rx: 14, ry: 180 },
  "/settings":    { mood: "thinking", tip: "robot_tip_settings",    rx: 14, ry: 140 },
};

const BODY_A: Record<string,any> = {
  idle:     { y:[0,-5,0],                       transition:{repeat:Infinity,duration:2.8,ease:"easeInOut"} },
  excited:  { y:[0,-9,0],  rotate:[-3,3,-3],    transition:{repeat:Infinity,duration:1.1} },
  dancing:  { y:[0,-11,0], rotate:[-6,6,-6], x:[-4,4,-4], transition:{repeat:Infinity,duration:0.75} },
  thinking: { y:[0,-4,0],  rotate:[0,4,0],      transition:{repeat:Infinity,duration:2} },
  proud:    { y:[0,-7,0],  scale:[1,1.06,1],    transition:{repeat:Infinity,duration:1.4} },
  waving:   { y:[0,-6,0],                       transition:{repeat:Infinity,duration:1.9} },
};
const ARM_LA: Record<string,any> = {
  idle:     { rotate:[0,8,0],       transition:{repeat:Infinity,duration:2.4} },
  dancing:  { rotate:[-25,25,-25],  transition:{repeat:Infinity,duration:0.55} },
  excited:  { rotate:[-12,12,-12],  transition:{repeat:Infinity,duration:0.75} },
  thinking: { rotate:[0,35,0],      transition:{repeat:Infinity,duration:1.8} },
  proud:    { rotate:[-18,0,-18],   transition:{repeat:Infinity,duration:1.4} },
  waving:   { rotate:[-35,35,-35],  transition:{repeat:Infinity,duration:0.45} },
};
const ARM_RA: Record<string,any> = {
  idle:     { rotate:[0,-8,0],      transition:{repeat:Infinity,duration:2.4,delay:0.3} },
  dancing:  { rotate:[25,-25,25],   transition:{repeat:Infinity,duration:0.55} },
  excited:  { rotate:[12,-12,12],   transition:{repeat:Infinity,duration:0.75,delay:0.15} },
  thinking: { rotate:[0,18,0],      transition:{repeat:Infinity,duration:2.8} },
  proud:    { rotate:[18,0,18],     transition:{repeat:Infinity,duration:1.4} },
  waving:   { rotate:[6,-6,6],      transition:{repeat:Infinity,duration:1.9} },
};
const HEAD_A: Record<string,any> = {
  idle:     { rotate:[0,4,-4,0],   transition:{repeat:Infinity,duration:3.8} },
  dancing:  { rotate:[-9,9,-9],    transition:{repeat:Infinity,duration:0.65} },
  excited:  { rotate:[-6,6,-6],    transition:{repeat:Infinity,duration:0.85} },
  thinking: { rotate:[6,12,6],     transition:{repeat:Infinity,duration:2.3} },
  proud:    { scale:[1,1.1,1],     transition:{repeat:Infinity,duration:1.8} },
  waving:   { rotate:[-6,6,-6],    transition:{repeat:Infinity,duration:0.95} },
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
  const [kbH, setKbH] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const pg   = PAGE_MOODS[location.pathname] || PAGE_MOODS["/"];
  const mood = pg.mood;

  // كشف الكيبورد
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const fn = () => { const d = window.innerHeight - vv.height; setKbH(d > 80 ? d : 0); };
    vv.addEventListener("resize", fn);
    return () => vv.removeEventListener("resize", fn);
  }, []);

  // فقاعة نص تظهر عند تغيير الصفحة
  useEffect(() => {
    setShowTip(true);
    const t = setTimeout(() => setShowTip(false), 4000);
    return () => clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    if (chatOpen && messages.length === 0)
      setMessages([{ role:"model", text:t("assistant_welcome") }]);
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
    const updated = [...messages, { role:"user", text } as Message];
    setMessages(updated);
    setIsLoading(true);
    try {
      const res = await askAssistant(text, updated.map(m => ({ role:m.role, text:m.text })));
      setMessages(prev => [...prev, { role:"model", text:res }]);
    } catch {
      setMessages(prev => [...prev, { role:"model", text:t("error_occurred") }]);
    } finally { setIsLoading(false); }
  }, [input, isLoading, messages, t]);

  if (location.pathname === "/assistant") return null;

  // الروبوت: عرض كامل = arm + body*2 + arm = 20+28+20 = 68px
  // ارتفاع كامل = head + body = 36+47 = 83px
  const RW = 68, RH = 83;

  return (
    <>
      {/* ===== الروبوت ===== */}
      <motion.div
        animate={{ right: isRtl ? "auto" : pg.rx, left: isRtl ? pg.rx : "auto", bottom: pg.ry }}
        transition={{ type:"spring", stiffness:80, damping:16 }}
        style={{ position:"fixed", zIndex:40, width:RW, height:RH }}
        className="select-none"
      >
        {/* فقاعة النص */}
        <AnimatePresence>
          {showTip && !chatOpen && (
            <motion.div
              initial={{ opacity:0, scale:0.75, y:8 }}
              animate={{ opacity:1, scale:1,    y:0 }}
              exit={{   opacity:0, scale:0.75,  y:8 }}
              style={{
                position:"absolute", bottom:"100%", right: isRtl ? "auto" : 0,
                left: isRtl ? 0 : "auto", marginBottom:8,
                background:"linear-gradient(135deg,#1a0533,#2d1060)",
                border:"1px solid rgba(168,85,247,.45)",
                borderRadius:14, padding:"7px 11px",
                fontSize:11, lineHeight:1.55, color:"#e2e8f0",
                boxShadow:"0 4px 20px rgba(168,85,247,.35)",
                minWidth:140, maxWidth:200,
                textAlign: isRtl ? "right" : "left",
                whiteSpace:"normal", zIndex:5,
              }}
            >
              {t(pg.tip)}
              <div style={{
                position:"absolute", top:"100%",
                right: isRtl ? "auto" : 14, left: isRtl ? 14 : "auto",
                width:0, height:0,
                borderLeft:"7px solid transparent", borderRight:"7px solid transparent",
                borderTop:"7px solid rgba(168,85,247,.45)",
              }}/>
            </motion.div>
          )}
        </AnimatePresence>

        {/* جسم الروبوت */}
        <motion.div
          animate={BODY_A[mood]}
          style={{ width:"100%", height:"100%", position:"relative", cursor:"pointer" }}
          whileTap={{ scale:0.85 }}
          onClick={() => { setChatOpen(true); setShowTip(false); }}
        >
          {/* ذراع يسار */}
          <motion.img
            src={armLImg} alt="" draggable={false}
            animate={ARM_LA[mood]}
            style={{
              position:"absolute",
              left: 0,
              top: H.head.h + 10,
              width: H.arm.w, height: H.arm.h,
              transformOrigin:"85% 30%",
              objectFit:"contain",
              filter:"drop-shadow(0 2px 4px rgba(0,0,0,.5))",
            }}
          />
          {/* ذراع يمين */}
          <motion.img
            src={armRImg} alt="" draggable={false}
            animate={ARM_RA[mood]}
            style={{
              position:"absolute",
              right: 0,
              top: H.head.h + 10,
              width: H.arm.w, height: H.arm.h,
              transformOrigin:"15% 30%",
              objectFit:"contain",
              filter:"drop-shadow(0 2px 4px rgba(0,0,0,.5))",
            }}
          />
          {/* رأس */}
          <motion.img
            src={headImg} alt="" draggable={false}
            animate={HEAD_A[mood]}
            style={{
              position:"absolute",
              left:"50%", top:0,
              transform:"translateX(-50%)",
              width: H.head.w, height: H.head.h,
              transformOrigin:"50% 100%",
              objectFit:"contain",
              filter:"drop-shadow(0 0 8px rgba(168,85,247,.7))",
              zIndex:3,
            }}
          />
          {/* جسم يسار */}
          <img
            src={bodyLImg} alt="" draggable={false}
            style={{
              position:"absolute",
              left:"50%", marginLeft: -H.body.w,
              top: H.head.h - 4,
              width: H.body.w, height: H.body.h,
              objectFit:"contain",
              filter:"drop-shadow(0 4px 8px rgba(0,0,0,.4))",
              zIndex:2,
            }}
          />
          {/* جسم يمين */}
          <img
            src={bodyRImg} alt="" draggable={false}
            style={{
              position:"absolute",
              left:"50%",
              top: H.head.h - 4,
              width: H.body.w, height: H.body.h,
              objectFit:"contain",
              filter:"drop-shadow(0 4px 8px rgba(0,0,0,.4))",
              zIndex:2,
            }}
          />
          {/* توهج */}
          <motion.div
            animate={{ scale:[1,1.5,1], opacity:[0.15,0.4,0.15] }}
            transition={{ repeat:Infinity, duration:2.5 }}
            style={{
              position:"absolute", inset:0,
              borderRadius:"50%",
              background:"rgba(168,85,247,.12)",
              filter:"blur(12px)",
              pointerEvents:"none", zIndex:1,
            }}
          />
          {/* نقطة خضراء */}
          <div style={{
            position:"absolute", top:-3, right:-3,
            width:10, height:10,
            background:"#4ade80", borderRadius:"50%",
            border:"2px solid #000",
            boxShadow:"0 0 6px #4ade80",
            animation:"pulse 2s infinite",
            zIndex:5,
          }}/>
        </motion.div>
      </motion.div>

      {/* ===== Backdrop ===== */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={() => setChatOpen(false)}
            style={{ position:"fixed", inset:0, zIndex:48, background:"rgba(0,0,0,.55)", backdropFilter:"blur(4px)" }}
          />
        )}
      </AnimatePresence>

      {/* ===== Chat Drawer ===== */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ y:"100%" }}
            animate={{ y:0 }}
            exit={{ y:"100%" }}
            transition={{ type:"spring", damping:28, stiffness:340 }}
            style={{
              position:"fixed", inset:"0 0 auto 0",
              bottom: kbH,
              height: kbH > 0 ? `calc(80vh - ${kbH}px)` : "72vh",
              zIndex:50,
              background:"#09090f",
              borderTop:"1px solid rgba(255,255,255,.08)",
              borderRadius:"28px 28px 0 0",
              display:"flex", flexDirection:"column",
              overflow:"hidden",
            }}
          >
            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,.08)", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <img src={headImg} alt="" style={{ width:34, height:34, objectFit:"contain", filter:"drop-shadow(0 0 8px rgba(168,85,247,.8))" }}/>
                <div>
                  <p style={{ fontSize:11, fontWeight:900, letterSpacing:"0.12em", textTransform:"uppercase", color:"#fff", margin:0 }}>{t("app_name")} AI</p>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                    <div style={{ width:6, height:6, background:"#4ade80", borderRadius:"50%", animation:"pulse 2s infinite" }}/>
                    <span style={{ fontSize:9, fontWeight:700, color:"#4ade80", textTransform:"uppercase", letterSpacing:"0.1em" }}>Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                style={{ padding:"8px", borderRadius:14, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", color:"#9ca3af", cursor:"pointer", display:"flex" }}
              >
                <ChevronDown size={18}/>
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              dir={isRtl ? "rtl" : "ltr"}
              style={{ flex:1, overflowY:"auto", padding:"12px 16px", display:"flex", flexDirection:"column", gap:12, overscrollBehavior:"contain" }}
            >
              {messages.map((m,i) => (
                <motion.div
                  key={i}
                  initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                  style={{ display:"flex", gap:8, alignItems:"flex-end", flexDirection: m.role==="user" ? "row-reverse" : "row" }}
                >
                  {m.role === "model" && (
                    <img src={headImg} alt="" style={{ width:24, height:24, objectFit:"contain", flexShrink:0 }}/>
                  )}
                  <div style={{
                    padding:"10px 14px", borderRadius:18,
                    fontSize:12, lineHeight:1.6,
                    maxWidth:"78%", wordBreak:"break-word",
                    background: m.role==="user" ? "#a855f7" : "rgba(255,255,255,.1)",
                    color: "#f1f5f9",
                    border: m.role==="user" ? "none" : "1px solid rgba(255,255,255,.1)",
                  }}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
                  <img src={headImg} alt="" style={{ width:24, height:24, objectFit:"contain", opacity:0.7 }}/>
                  <div style={{ padding:"10px 14px", borderRadius:18, background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.1)", display:"flex", alignItems:"center", gap:8 }}>
                    <Loader2 size={12} style={{ color:"#a855f7", animation:"spin 1s linear infinite" }}/>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,.4)" }}>{t("thinking")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick buttons */}
            <div style={{ padding:"8px 16px", display:"flex", gap:8, overflowX:"auto", flexShrink:0, borderTop:"1px solid rgba(255,255,255,.05)" }}>
              {[t("q_withdraw"), t("q_points"), t("q_min")].map(q => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  style={{ whiteSpace:"nowrap", padding:"6px 12px", borderRadius:12, background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.1)", fontSize:10, fontWeight:700, color:"rgba(255,255,255,.6)", cursor:"pointer", flexShrink:0 }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div dir={isRtl ? "rtl" : "ltr"} style={{ padding:"10px 16px 20px", flexShrink:0 }}>
              <div style={{ display:"flex", gap:8, alignItems:"center", background:"#fff", borderRadius:18, padding:"6px 6px 6px 14px" }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && handleSend()}
                  placeholder={t("type_question")}
                  style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:13, color:"#111", textAlign: isRtl ? "right" : "left" }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  style={{ width:36, height:36, borderRadius:12, background:"#a855f7", border:"none", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, opacity: (isLoading||!input.trim()) ? 0.4 : 1 }}
                >
                  {isLoading ? <Loader2 size={15} style={{ animation:"spin 1s linear infinite" }}/> : <Send size={15}/>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
