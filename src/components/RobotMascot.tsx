/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";

import headImg from "@/src/assets/robot/head.png";
import bodyImg from "@/src/assets/robot/body.png";
import armLeftImg from "@/src/assets/robot/arm_left.png";
import armRightImg from "@/src/assets/robot/arm_right.png";
import legLeftImg from "@/src/assets/robot/leg_left.png";
import legRightImg from "@/src/assets/robot/leg_right.png";

const PAGE_TIPS: Record<string, string> = {
  "/": "اضغط على CLAIM يومياً عشان توصل لـ 100 نقطة في اليوم السابع! 🔥",
  "/earn": "جرب عجلة الحظ كل يوم، عندك لفة مجانية بانتظارك!",
  "/wallet": "وصلت لـ $5؟ تقدر تسحب أرباحك من هنا مباشرة.",
  "/leaderboard": "كل ما تكمل مهام أكثر كل ما ترتفع في الترتيب!",
  "/profile": "وثّق حسابك عشان تفتح مكافآت أعلى.",
};

function getTipForPath(path: string): string {
  return PAGE_TIPS[path] || "احتاج مساعدة؟ اضغط علي وأنا أساعدك! 🤖";
}

interface RobotMascotProps {
  onOpenChat: () => void;
}

export default function RobotMascot({ onOpenChat }: RobotMascotProps) {
  const location = useLocation();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const roamRef = useRef(false);

  const roam = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const robotW = 80, robotH = 110, margin = 16;
    const newX = margin + Math.random() * (vw - robotW - margin * 2);
    const newY = 90 + Math.random() * (vh - robotH - 140 - 90);
    setPos({ x: newX, y: newY });
  }, []);

  useEffect(() => {
    roam();
    const id = setInterval(() => { if (!roamRef.current) roam(); }, 8000);
    return () => clearInterval(id);
  }, [roam]);

  useEffect(() => {
    setBubbleText(getTipForPath(location.pathname));
    setShowBubble(true);
    const t = setTimeout(() => setShowBubble(false), 4500);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const handleClick = useCallback(() => {
    setShowBubble(false);
    roamRef.current = true;
    onOpenChat();
  }, [onOpenChat]);

  return (
    <div
      className="fixed z-[65] pointer-events-none"
      style={{
        width: 80, height: 110,
        left: pos.x, top: pos.y,
        transition: "left 2s cubic-bezier(0.4,0,0.2,1), top 2s cubic-bezier(0.4,0,0.2,1)",
        willChange: "left, top",
      }}
    >
      <AnimatePresence mode="wait">
        {showBubble && (
          <motion.div
            key="bubble"
            initial={{ opacity: 0, scale: 0.8, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 6 }}
            transition={{ duration: 0.3 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 w-44 pointer-events-auto"
          >
            <div
              onClick={handleClick}
              className="bg-white/95 text-gray-900 text-[11px] font-semibold rounded-2xl px-3 py-2 shadow-xl cursor-pointer text-center leading-snug"
            >
              {bubbleText}
            </div>
            <div className="w-3 h-3 bg-white/95 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative w-full h-full pointer-events-auto cursor-pointer"
        onClick={handleClick}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ willChange: "transform" }}
      >
        <motion.img src={headImg} alt="" draggable={false}
          className="absolute left-1/2 -translate-x-1/2 top-0 w-[60px] drop-shadow-lg select-none"
          animate={{ rotate: [-6, 6, -6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 90%", willChange: "transform" }}
        />
        <motion.img src={armLeftImg} alt="" draggable={false}
          className="absolute top-[52px] left-[16px] w-[15px] drop-shadow-md select-none z-0"
          animate={{ rotate: [0, -20, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
          style={{ transformOrigin: "50% 0%", willChange: "transform" }}
        />
        <motion.img src={armRightImg} alt="" draggable={false}
          className="absolute top-[52px] right-[16px] w-[15px] drop-shadow-md select-none z-0"
          animate={{ rotate: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 0%", willChange: "transform" }}
        />
        <img src={bodyImg} alt="" draggable={false}
          className="absolute left-1/2 -translate-x-1/2 top-[48px] w-[40px] drop-shadow-lg select-none z-10"
        />
        <motion.img src={legLeftImg} alt="" draggable={false}
          className="absolute top-[69px] left-[22px] w-[15px] drop-shadow-md select-none"
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 0%", willChange: "transform" }}
        />
        <motion.img src={legRightImg} alt="" draggable={false}
          className="absolute top-[69px] right-[22px] w-[15px] drop-shadow-md select-none"
          animate={{ rotate: [4, -4, 4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 0%", willChange: "transform" }}
        />
        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-8 h-2 bg-purple-500/40 rounded-full blur-md" />
      </motion.div>
    </div>
  );
}
