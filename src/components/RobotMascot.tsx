/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";

import headImg    from "@/src/assets/robot/head.png";
import bodyImg    from "@/src/assets/robot/body.png";
import armLeftImg from "@/src/assets/robot/arm_left.png";
import armRightImg from "@/src/assets/robot/arm_right.png";
import legLeftImg from "@/src/assets/robot/leg_left.png";
import legRightImg from "@/src/assets/robot/leg_right.png";

// ─── نصوص الفقاعات لكل صفحة (متعددة، يتناوب عليها الروبوت) ───
const PAGE_SCRIPT: Record<string, string[]> = {
  "/": [
    "اضغط CLAIM كل يوم 🔥 لو تمشي 7 أيام متتالية توصل لـ 100 نقطة في يوم واحد!",
    "شوف الرصيد هنا فوق — كل نقطة بتحسبها BoyCash ليك ✨",
    "مستواك الحالي Bronze — أكمل مهام وارتفع للـ Silver وافتح مكافآت أكبر! 🏆",
  ],
  "/earn": [
    "عجلة الحظ تلفيفة مجانية كل يوم — اضغط عليها دلوقتي! 🎡",
    "المهام الإعلانية هنا بتكسبك نقاط فورية — كل إعلان = نقاط حقيقية 💰",
    "كلما شاهدت أكثر، كلما جمعت أسرع — ما في حد للكسب! ⚡",
  ],
  "/wallet": [
    "وصلت لـ $5؟ تقدر تسحب فلوسك من هنا مباشرة! 💸",
    "اختار طريقة الدفع المناسبة ليك — PayPal، Crypto، أو بطاقة هدايا 🎁",
    "مدة السحب من 1-3 أيام عمل — نضمن وصول فلوسك آمن ✅",
  ],
  "/leaderboard": [
    "شوف مرتبتك بين كل المستخدمين — هل أنت بالـ Top 10؟ 🥇",
    "كل ما تكمل مهام أكثر كل ما ترتفع — المنافسة حامية! 🔥",
    "المراكز الأولى بتاخذ مكافآت إضافية كل أسبوع 🏅",
  ],
  "/profile": [
    "وثّق حسابك عشان تفتح مكافآت المستوى الأعلى 📋",
    "صورة البروفايل والمعلومات هنا — اكملها عشان تبدو احترافي 😎",
    "تاريخ نشاطك ونقاطك كلها مسجلة هنا — تابع تقدمك! 📈",
  ],
  "/settings": [
    "من هنا تتحكم بإشعاراتك ولغة التطبيق 🌐",
    "فعّل الإشعارات عشان ما تفوّتك أي مهمة أو مكافأة! 🔔",
  ],
};

function getScriptForPath(path: string): string[] {
  return PAGE_SCRIPT[path] || [
    "هلا! أنا هنا لو احتجت أي مساعدة 👋",
    "تفضّل وتجوّل — BoyCash كله مكافآت وفلوس حقيقية 💰",
  ];
}

// ─── نوع حالة الروبوت ───
type RobotState = "roaming" | "pointing" | "talking";

// ─── مكون الفقاعة ───
const SpeechBubble = memo(function SpeechBubble({
  text,
  side,
  isPointing,
}: {
  text: string;
  side: "left" | "right";
  isPointing: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7, y: 8 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="absolute pointer-events-none"
      style={{
        bottom: "calc(100% + 10px)",
        [side === "right" ? "left" : "right"]: "-8px",
        width: 180,
        willChange: "opacity, transform",
        zIndex: 10,
      }}
    >
      {/* الفقاعة نفسها */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(20,10,40,0.97) 0%, rgba(60,20,100,0.97) 100%)",
          border: "1.5px solid rgba(180,100,255,0.35)",
          borderRadius: 16,
          padding: "10px 13px",
          boxShadow: "0 8px 32px rgba(120,40,220,0.25), 0 2px 8px rgba(0,0,0,0.4)",
          backdropFilter: "blur(12px)",
        }}
      >
        {isPointing && (
          <div className="flex items-center gap-1 mb-1 opacity-70">
            <span style={{ fontSize: 9, color: "#c084fc", letterSpacing: 1, fontWeight: 700 }}>
              BoyCash AI
            </span>
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: 4, height: 4, borderRadius: "50%", background: "#a855f7", display: "inline-block" }}
            />
          </div>
        )}
        <p
          style={{
            fontSize: 11.5,
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
      </div>

      {/* ذيل الفقاعة */}
      <div
        style={{
          position: "absolute",
          bottom: -7,
          [side === "right" ? "left" : "right"]: 18,
          width: 14,
          height: 14,
          background: "rgba(60,20,100,0.97)",
          border: "1.5px solid rgba(180,100,255,0.35)",
          borderTop: "none",
          borderLeft: side === "right" ? "none" : undefined,
          borderRight: side === "left" ? "none" : undefined,
          transform: "rotate(45deg)",
          borderRadius: 2,
        }}
      />
    </motion.div>
  );
});

// ─── مكون الروبوت البصري ───
const RobotBody = memo(function RobotBody({
  state,
  faceDir,
  onClick,
}: {
  state: RobotState;
  faceDir: "left" | "right";
  onClick: () => void;
}) {
  const isPointing = state === "pointing";
  const isTalking  = state === "talking";

  return (
    <motion.div
      className="relative cursor-pointer"
      style={{ width: 72, height: 100, willChange: "transform" }}
      onClick={onClick}
      // طفو عام
      animate={{ y: [0, -7, 0] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      // flip اتجاه الوجه
      initial={false}
    >
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          scaleX: faceDir === "left" ? -1 : 1,
          willChange: "transform",
        }}
        animate={{ scaleX: faceDir === "left" ? -1 : 1 }}
        transition={{ duration: 0.25 }}
      >
        {/* الرأس */}
        <motion.img
          src={headImg}
          draggable={false}
          className="absolute select-none"
          style={{ left: "50%", translateX: "-50%", top: 0, width: 54 }}
          animate={{
            rotate: isTalking ? [-4, 4, -4] : [-3, 3, -3],
          }}
          transition={{
            duration: isTalking ? 0.6 : 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* ذراع يسار */}
        <motion.img
          src={armLeftImg}
          draggable={false}
          className="absolute select-none"
          style={{ top: 46, left: 10, width: 14, transformOrigin: "50% 0%" }}
          animate={{
            rotate: isPointing ? [-60, -55, -60] : [0, -15, 0],
          }}
          transition={{
            duration: isPointing ? 0.8 : 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* ذراع يمين */}
        <motion.img
          src={armRightImg}
          draggable={false}
          className="absolute select-none"
          style={{ top: 46, right: 10, width: 14, transformOrigin: "50% 0%" }}
          animate={{
            rotate: isPointing ? [60, 55, 60] : [0, 10, 0],
          }}
          transition={{
            duration: isPointing ? 0.8 : 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* الجسم */}
        <img
          src={bodyImg}
          draggable={false}
          className="absolute select-none"
          style={{ left: "50%", translateX: "-50%", top: 42, width: 38 }}
        />

        {/* الأرجل */}
        <motion.img
          src={legLeftImg}
          draggable={false}
          className="absolute select-none"
          style={{ top: 62, left: 18, width: 14, transformOrigin: "50% 0%" }}
          animate={{ rotate: isTalking ? [-8, 8, -8] : [-3, 3, -3] }}
          transition={{ duration: isTalking ? 0.5 : 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src={legRightImg}
          draggable={false}
          className="absolute select-none"
          style={{ top: 62, right: 18, width: 14, transformOrigin: "50% 0%" }}
          animate={{ rotate: isTalking ? [8, -8, 8] : [3, -3, 3] }}
          transition={{ duration: isTalking ? 0.5 : 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* ظل */}
      <div
        style={{
          position: "absolute",
          bottom: -3,
          left: "50%",
          transform: "translateX(-50%)",
          width: 34,
          height: 8,
          borderRadius: "50%",
          background: "rgba(140,60,255,0.35)",
          filter: "blur(5px)",
        }}
      />
    </motion.div>
  );
});

// ─── المكوّن الرئيسي ───
export default function RobotMascot() {
  const location = useLocation();

  // موضع الروبوت
  const [pos, setPos]         = useState({ x: 30, y: 200 });
  const [faceDir, setFaceDir] = useState<"left" | "right">("right");
  const [state, setState]     = useState<RobotState>("roaming");

  // الفقاعة
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleText, setBubbleText]       = useState("");
  const [bubbleSide, setBubbleSide]       = useState<"left" | "right">("right");

  // مؤشر الجملة الحالية بكل صفحة
  const scriptIndexRef = useRef(0);
  const timerRefs      = useRef<ReturnType<typeof setTimeout>[]>([]);
  const posRef         = useRef(pos);
  posRef.current = pos;

  const clearTimers = () => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  };

  const addTimer = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timerRefs.current.push(id);
    return id;
  };

  // ─── انتقال الروبوت لموضع جديد ───
  const moveTo = useCallback((x: number, y: number) => {
    const oldX = posRef.current.x;
    setFaceDir(x > oldX ? "right" : "left");
    setPos({ x, y });
  }, []);

  // ─── إظهار فقاعة ───
  const showBubble = useCallback((text: string, durationMs = 4000) => {
    const side = posRef.current.x > window.innerWidth / 2 ? "left" : "right";
    setBubbleSide(side);
    setBubbleText(text);
    setBubbleVisible(true);
    setState("talking");
    addTimer(() => {
      setBubbleVisible(false);
      setState("roaming");
    }, durationMs);
  }, []);

  // ─── جولة التجوّل العشوائية ───
  const startRoamCycle = useCallback(() => {
    const roam = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rx = 20 + Math.random() * (vw - 110);
      const ry = 100 + Math.random() * (vh - 260);
      moveTo(rx, ry);
      // بعد 4 ثواني من التجوّل، عرض نصيحة تلقائية
      addTimer(() => {
        const script = getScriptForPath(location.pathname);
        scriptIndexRef.current = (scriptIndexRef.current + 1) % script.length;
        showBubble(script[scriptIndexRef.current], 4200);
        // بعد الفقاعة، روح لموضع تاني
        addTimer(roam, 5500);
      }, 4000);
    };
    roam();
  }, [location.pathname, moveTo, showBubble]);

  // ─── إعادة تشغيل عند تغيير الصفحة ───
  useEffect(() => {
    clearTimers();
    scriptIndexRef.current = 0;
    setState("roaming");
    setBubbleVisible(false);

    // انتقل فوراً لموضع عشوائي
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rx = 20 + Math.random() * (vw - 110);
    const ry = 100 + Math.random() * (vh - 260);
    moveTo(rx, ry);

    // أظهر فقاعة الترحيب بالصفحة بعد ثانية
    addTimer(() => {
      const script = getScriptForPath(location.pathname);
      showBubble(script[0], 4500);
      addTimer(startRoamCycle, 6000);
    }, 1200);

    return clearTimers;
  }, [location.pathname]);

  // ─── عند الضغط على الروبوت ───
  const handleClick = useCallback(() => {
    clearTimers();
    const script = getScriptForPath(location.pathname);
    scriptIndexRef.current = (scriptIndexRef.current + 1) % script.length;
    showBubble(script[scriptIndexRef.current], 5000);
    addTimer(startRoamCycle, 6500);
  }, [location.pathname, showBubble, startRoamCycle]);

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: 72,
        height: 100,
        zIndex: 9000,
        transition: "left 2.2s cubic-bezier(0.4,0,0.2,1), top 2.2s cubic-bezier(0.4,0,0.2,1)",
        willChange: "left, top",
      }}
    >
      {/* فقاعة الكلام */}
      <AnimatePresence mode="wait">
        {bubbleVisible && (
          <SpeechBubble
            key={bubbleText}
            text={bubbleText}
            side={bubbleSide}
            isPointing={state === "pointing"}
          />
        )}
      </AnimatePresence>

      {/* الروبوت */}
      <RobotBody
        state={state}
        faceDir={faceDir}
        onClick={handleClick}
      />
    </div>,
    document.body
  );
}
