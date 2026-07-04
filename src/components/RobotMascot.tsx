/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";
import { askAssistant } from "@/src/services/aiService";

import headImg     from "@/src/assets/robot/head.png";
import bodyImg     from "@/src/assets/robot/body.png";
import armLeftImg  from "@/src/assets/robot/arm_left.png";
import armRightImg from "@/src/assets/robot/arm_right.png";
import legLeftImg  from "@/src/assets/robot/leg_left.png";
import legRightImg from "@/src/assets/robot/leg_right.png";

// ─── نصوص تلقائية لكل صفحة ───
const PAGE_SCRIPT: Record<string, string[]> = {
  "/": [
    "اضغط CLAIM كل يوم 🔥 لو تمشي 7 أيام متتالية توصل لـ 100 نقطة في يوم واحد!",
    "شوف الرصيد هنا فوق — كل نقطة بتحسبها BoyCash ليك ✨",
    "مستواك الحالي Bronze — أكمل مهام وارتفع للـ Silver وافتح مكافآت أكبر! 🏆",
  ],
  "/earn": [
    "عجلة الحظ تلفيفة مجانية كل يوم — اضغط عليها دلوقتي! 🎡",
    "المهام الإعلانية هنا بتكسبك نقاط فورية 💰",
    "كلما شاهدت أكثر، كلما جمعت أسرع ⚡",
  ],
  "/wallet": [
    "وصلت لـ $5؟ تقدر تسحب فلوسك من هنا مباشرة! 💸",
    "اختار طريقة الدفع المناسبة ليك — PayPal، Crypto، أو بطاقة هدايا 🎁",
    "مدة السحب من 1-3 أيام عمل ✅",
  ],
  "/leaderboard": [
    "شوف مرتبتك بين كل المستخدمين 🥇",
    "المراكز الأولى بتاخذ مكافآت إضافية كل أسبوع 🏅",
  ],
  "/profile": [
    "وثّق حسابك عشان تفتح مكافآت المستوى الأعلى 📋",
    "تاريخ نشاطك ونقاطك مسجلة هنا — تابع تقدمك! 📈",
  ],
  "/settings": [
    "من هنا تتحكم بإشعاراتك ولغة التطبيق 🌐",
    "فعّل الإشعارات عشان ما تفوّتك أي مكافأة! 🔔",
  ],
};

function getScript(path: string): string[] {
  return PAGE_SCRIPT[path] || [
    "هلا! اضغط علي واسألني أي شيء 👋",
    "BoyCash كله مكافآت وفلوس حقيقية 💰",
  ];
}

type RobotState = "roaming" | "talking" | "listening" | "thinking";

// ─── فقاعة الكلام ───
const SpeechBubble = memo(function SpeechBubble({
  text,
  side,
  isThinking,
}: {
  text: string;
  side: "left" | "right";
  isThinking?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.75, y: 10 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      style={{
        position: "absolute",
        bottom: "calc(100% + 12px)",
        [side === "right" ? "left" : "right"]: "-6px",
        width: 190,
        zIndex: 10,
        pointerEvents: "none",
        willChange: "opacity, transform",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg,rgba(14,6,32,0.97) 0%,rgba(55,15,95,0.97) 100%)",
          border: "1.5px solid rgba(180,90,255,0.35)",
          borderRadius: 18,
          padding: "10px 14px",
          boxShadow: "0 8px 30px rgba(110,30,200,0.28), 0 2px 8px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginBottom: 5,
          }}
        >
          <span
            style={{
              fontSize: 9,
              color: "#c084fc",
              letterSpacing: 1,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            BoyCash AI
          </span>
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#a855f7",
              display: "inline-block",
            }}
          />
        </div>

        {isThinking ? (
          <div style={{ display: "flex", gap: 5, justifyContent: "center", padding: "4px 0" }}>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#c084fc",
                  display: "inline-block",
                }}
              />
            ))}
          </div>
        ) : (
          <p
            style={{
              fontSize: 12,
              lineHeight: 1.55,
              color: "#f3e8ff",
              margin: 0,
              fontWeight: 500,
              direction: "rtl",
              textAlign: "right",
            }}
          >
            {text}
          </p>
        )}
      </div>

      {/* ذيل الفقاعة */}
      <div
        style={{
          position: "absolute",
          bottom: -7,
          [side === "right" ? "left" : "right"]: 20,
          width: 14,
          height: 14,
          background: "rgba(55,15,95,0.97)",
          border: "1.5px solid rgba(180,90,255,0.35)",
          borderTop: "none",
          [side === "right" ? "borderLeft" : "borderRight"]: "none",
          transform: "rotate(45deg)",
          borderRadius: 2,
        }}
      />
    </motion.div>
  );
});

// ─── بار الكتابة الصغير تحت الروبوت ───
const InputBar = memo(function InputBar({
  side,
  onSend,
  onClose,
  loading,
}: {
  side: "left" | "right";
  onSend: (text: string) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [val, setVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // focus تلقائي لما يظهر البار
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const submit = () => {
    const t = val.trim();
    if (!t || loading) return;
    setVal("");
    onSend(t);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{
        position: "absolute",
        top: "calc(100% + 10px)",
        [side === "right" ? "left" : "right"]: "-6px",
        width: 200,
        zIndex: 10,
        willChange: "opacity, transform",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg,rgba(14,6,32,0.97) 0%,rgba(55,15,95,0.97) 100%)",
          border: "1.5px solid rgba(180,90,255,0.4)",
          borderRadius: 50,
          padding: "6px 8px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          boxShadow: "0 6px 24px rgba(110,30,200,0.3)",
        }}
      >
        <input
          ref={inputRef}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); submit(); }
            if (e.key === "Escape") onClose();
          }}
          placeholder="اسألني..."
          disabled={loading}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#f3e8ff",
            fontSize: 12,
            direction: "rtl",
            textAlign: "right",
            paddingRight: 4,
          }}
        />

        {/* زر إرسال أو إغلاق */}
        {val.trim() ? (
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={submit}
            disabled={loading}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: loading ? "rgba(168,85,247,0.4)" : "rgba(168,85,247,0.9)",
              border: "none",
              cursor: loading ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "rgba(255,255,255,0.5)",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            ×
          </motion.button>
        )}
      </div>
    </motion.div>
  );
});

// ─── جسم الروبوت ───
const RobotBody = memo(function RobotBody({
  state,
  faceDir,
  onClick,
}: {
  state: RobotState;
  faceDir: "left" | "right";
  onClick: () => void;
}) {
  const isTalking  = state === "talking";
  const isThinking = state === "thinking";

  return (
    <motion.div
      className="relative"
      style={{ width: 72, height: 100, cursor: "pointer", willChange: "transform" }}
      onClick={onClick}
      animate={{ y: [0, -7, 0] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        style={{ width: "100%", height: "100%", willChange: "transform" }}
        animate={{ scaleX: faceDir === "left" ? -1 : 1 }}
        transition={{ duration: 0.22 }}
      >
        {/* أرجل */}
        <motion.img
          src={legLeftImg} draggable={false}
          className="absolute select-none"
          style={{ top: 62, left: 18, width: 14, transformOrigin: "50% 0%" }}
          animate={{ rotate: isTalking ? [-8, 8, -8] : [-3, 3, -3] }}
          transition={{ duration: isTalking ? 0.5 : 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src={legRightImg} draggable={false}
          className="absolute select-none"
          style={{ top: 62, right: 18, width: 14, transformOrigin: "50% 0%" }}
          animate={{ rotate: isTalking ? [8, -8, 8] : [3, -3, 3] }}
          transition={{ duration: isTalking ? 0.5 : 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* جسم */}
        <img
          src={bodyImg} draggable={false}
          className="absolute select-none"
          style={{ left: "50%", transform: "translateX(-50%)", top: 42, width: 38 }}
        />
        {/* ذراع يسار */}
        <motion.img
          src={armLeftImg} draggable={false}
          className="absolute select-none"
          style={{ top: 46, left: 10, width: 14, transformOrigin: "100% 20%" }}
          animate={{ rotate: isThinking ? [80, 75, 80] : [0, -14, 0] }}
          transition={{ duration: isThinking ? 1 : 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* ذراع يمين */}
        <motion.img
          src={armRightImg} draggable={false}
          className="absolute select-none"
          style={{ top: 46, right: 10, width: 14, transformOrigin: "0% 20%" }}
          animate={{ rotate: isThinking ? [-80, -75, -80] : [0, 10, 0] }}
          transition={{ duration: isThinking ? 1 : 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* رأس */}
        <motion.img
          src={headImg} draggable={false}
          className="absolute select-none"
          style={{ left: "50%", translateX: "-50%", top: 0, width: 54 }}
          animate={{ rotate: isTalking || isThinking ? [-5, 5, -5] : [-3, 3, -3] }}
          transition={{ duration: isTalking ? 0.55 : 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* ظل */}
      <div style={{
        position: "absolute", bottom: -3, left: "50%",
        transform: "translateX(-50%)", width: 34, height: 8,
        borderRadius: "50%", background: "rgba(140,60,255,0.35)", filter: "blur(5px)",
      }} />
    </motion.div>
  );
});

// ─── المكوّن الرئيسي ───
export default function RobotMascot() {
  const location = useLocation();

  const [pos, setPos]               = useState({ x: 30, y: 200 });
  const [faceDir, setFaceDir]       = useState<"left" | "right">("right");
  const [state, setState]           = useState<RobotState>("roaming");
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleSide, setBubbleSide] = useState<"left" | "right">("right");
  const [isThinkingBubble, setIsThinkingBubble] = useState(false);
  const [inputOpen, setInputOpen]   = useState(false);
  const [aiLoading, setAiLoading]   = useState(false);

  const scriptIndexRef = useRef(0);
  const timerRefs      = useRef<ReturnType<typeof setTimeout>[]>([]);
  const posRef         = useRef(pos);
  posRef.current = pos;

  const clearTimers = useCallback(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timerRefs.current.push(id);
    return id;
  }, []);

  const getSide = useCallback(() =>
    posRef.current.x > window.innerWidth / 2 ? "left" : "right", []);

  const moveTo = useCallback((x: number, y: number) => {
    setFaceDir(x > posRef.current.x ? "right" : "left");
    setPos({ x, y });
  }, []);

  const showTip = useCallback((text: string, durationMs = 4500) => {
    setIsThinkingBubble(false);
    setBubbleSide(getSide());
    setBubbleText(text);
    setBubbleVisible(true);
    setState("talking");
    addTimer(() => {
      setBubbleVisible(false);
      setState("roaming");
    }, durationMs);
  }, [getSide, addTimer]);

  const roamCycle = useCallback(() => {
    const doRoam = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      moveTo(20 + Math.random() * (vw - 110), 100 + Math.random() * (vh - 260));
      addTimer(() => {
        const script = getScript(location.pathname);
        scriptIndexRef.current = (scriptIndexRef.current + 1) % script.length;
        showTip(script[scriptIndexRef.current], 4200);
        addTimer(doRoam, 5800);
      }, 4000);
    };
    doRoam();
  }, [location.pathname, moveTo, showTip, addTimer]);

  // عند تغيير الصفحة
  useEffect(() => {
    clearTimers();
    setBubbleVisible(false);
    setInputOpen(false);
    setAiLoading(false);
    scriptIndexRef.current = 0;
    setState("roaming");

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    moveTo(20 + Math.random() * (vw - 110), 100 + Math.random() * (vh - 260));

    addTimer(() => {
      showTip(getScript(location.pathname)[0], 5000);
      addTimer(roamCycle, 6500);
    }, 1000);

    return clearTimers;
  }, [location.pathname]);

  // عند الضغط على الروبوت
  const handleRobotClick = useCallback(() => {
    if (aiLoading) return;
    clearTimers();
    setBubbleVisible(false);
    setInputOpen(prev => !prev);
    if (!inputOpen) setState("listening");
    else setState("roaming");
  }, [aiLoading, inputOpen, clearTimers]);

  // إرسال سؤال للـ AI
  const handleUserSend = useCallback(async (text: string) => {
    setInputOpen(false);
    setAiLoading(true);
    setState("thinking");

    // فقاعة "يفكر..."
    setIsThinkingBubble(true);
    setBubbleSide(getSide());
    setBubbleVisible(true);

    try {
      const reply = await askAssistant(text);
      setIsThinkingBubble(false);
      setBubbleText(reply);
      setState("talking");
      addTimer(() => {
        setBubbleVisible(false);
        setState("roaming");
        setAiLoading(false);
        addTimer(roamCycle, 1000);
      }, Math.max(reply.length * 60, 5000));
    } catch {
      setIsThinkingBubble(false);
      setBubbleText("حدث خطأ، جرب مرة أخرى 🙏");
      setState("talking");
      addTimer(() => {
        setBubbleVisible(false);
        setState("roaming");
        setAiLoading(false);
      }, 3000);
    }
  }, [getSide, addTimer, roamCycle]);

  const inputSide = getSide();

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: 72,
        height: 100,
        zIndex: 9000,
        transition: inputOpen
          ? "none"
          : "left 2.2s cubic-bezier(0.4,0,0.2,1), top 2.2s cubic-bezier(0.4,0,0.2,1)",
        willChange: "left, top",
      }}
    >
      {/* فقاعة الكلام */}
      <AnimatePresence mode="wait">
        {bubbleVisible && (
          <SpeechBubble
            key={isThinkingBubble ? "thinking" : bubbleText}
            text={bubbleText}
            side={bubbleSide}
            isThinking={isThinkingBubble}
          />
        )}
      </AnimatePresence>

      {/* بار الكتابة */}
      <AnimatePresence>
        {inputOpen && (
          <InputBar
            key="input-bar"
            side={inputSide}
            onSend={handleUserSend}
            onClose={() => {
              setInputOpen(false);
              setState("roaming");
              addTimer(roamCycle, 500);
            }}
            loading={aiLoading}
          />
        )}
      </AnimatePresence>

      {/* الروبوت */}
      <RobotBody
        state={state}
        faceDir={faceDir}
        onClick={handleRobotClick}
      />
    </div>,
    document.body
  );
}
