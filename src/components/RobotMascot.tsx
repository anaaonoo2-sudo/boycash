/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";
import { askAssistant } from "@/src/services/aiService";
import { X, Send, Loader2 } from "lucide-react";

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
  return PAGE_TIPS[path] || "احتاج مساعدة؟ اضغط علي وأنا أساعدك!";
}

// ─── الروبوت البصري ───
const RobotVisual = memo(function RobotVisual({
  pos, showBubble, bubbleText, onRobotClick, onBubbleClick,
}: {
  pos: { x: number; y: number };
  showBubble: boolean;
  bubbleText: string;
  onRobotClick: () => void;
  onBubbleClick: () => void;
}) {
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
              onClick={onBubbleClick}
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
        onClick={onRobotClick}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.img src={headImg} alt="" draggable={false}
          className="absolute left-1/2 -translate-x-1/2 top-0 w-[60px] drop-shadow-lg select-none"
          animate={{ rotate: [-6, 6, -6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 90%" }}
        />
        <motion.img src={armLeftImg} alt="" draggable={false}
          className="absolute top-[52px] left-[16px] w-[15px] drop-shadow-md select-none z-0"
          animate={{ rotate: [0, -20, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
          style={{ transformOrigin: "50% 0%" }}
        />
        <motion.img src={armRightImg} alt="" draggable={false}
          className="absolute top-[52px] right-[16px] w-[15px] drop-shadow-md select-none z-0"
          animate={{ rotate: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 0%" }}
        />
        <img src={bodyImg} alt="" draggable={false}
          className="absolute left-1/2 -translate-x-1/2 top-[48px] w-[40px] drop-shadow-lg select-none z-10"
        />
        <motion.img src={legLeftImg} alt="" draggable={false}
          className="absolute top-[69px] left-[22px] w-[15px] drop-shadow-md select-none"
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 0%" }}
        />
        <motion.img src={legRightImg} alt="" draggable={false}
          className="absolute top-[69px] right-[22px] w-[15px] drop-shadow-md select-none"
          animate={{ rotate: [4, -4, 4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 0%" }}
        />
        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-8 h-2 bg-purple-500/40 rounded-full blur-md" />
      </motion.div>
    </div>
  );
});

// ─── نافذة المحادثة ───
const ChatWindow = memo(function ChatWindow({
  chatHistory, chatInput, chatLoading, onInputChange, onSend, onClose,
}: {
  chatHistory: { role: "user" | "model"; text: string }[];
  chatInput: string;
  chatLoading: boolean;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onClose: () => void;
}) {
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // scroll للأسفل عند كل رسالة جديدة
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatHistory, chatLoading]);

  return (
    // Overlay خلف النافذة
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          background: "rgba(10,10,20,0.97)",
          border: "1px solid rgba(168,85,247,0.3)",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(168,85,247,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}>
          <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>مساعد BoyCash 🤖</span>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={messagesRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minHeight: 0,
          }}
        >
          {chatHistory.length === 0 && (
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textAlign: "center", marginTop: 20 }}>
              اسألني أي شيء عن التطبيق 👋
            </p>
          )}
          {chatHistory.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              background: m.role === "user" ? "#a855f7" : "rgba(255,255,255,0.08)",
              color: "white",
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "8px 12px",
              fontSize: 12,
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}>
              {m.text}
            </div>
          ))}
          {chatLoading && (
            <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
              <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> جاري الكتابة...
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0, background: "rgba(0,0,0,0.3)",
        }}>
          <input
            ref={inputRef}
            value={chatInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSend(); } }}
            placeholder="اكتب سؤالك..."
            enterKeyHint="send"
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "8px 12px",
              color: "white",
              fontSize: 13,
              outline: "none",
            }}
          />
          <button
            onClick={onSend}
            disabled={chatLoading || !chatInput.trim()}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: chatLoading || !chatInput.trim() ? "rgba(168,85,247,0.3)" : "#a855f7",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", flexShrink: 0,
            }}
          >
            <Send size={15} />
          </button>
        </div>
      </motion.div>
    </div>
  );
});

// ─── المكوّن الرئيسي ───
export default function RobotMascot() {
  const location = useLocation();

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "model"; text: string }[]>([]);

  const chatOpenRef = useRef(chatOpen);
  useEffect(() => { chatOpenRef.current = chatOpen; }, [chatOpen]);

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
    const id = setInterval(() => { if (!chatOpenRef.current) roam(); }, 8000);
    return () => clearInterval(id);
  }, [roam]);

  useEffect(() => {
    setBubbleText(getTipForPath(location.pathname));
    setShowBubble(true);
    const t = setTimeout(() => setShowBubble(false), 4500);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const handleRobotClick = useCallback(() => {
    setShowBubble(false);
    setChatOpen(true);
  }, []);

  const handleSendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput("");
    const updated = [...chatHistory, { role: "user" as const, text }];
    setChatHistory(updated);
    setChatLoading(true);
    try {
      const response = await askAssistant(text, updated);
      setChatHistory(prev => [...prev, { role: "model", text: response }]);
    } catch {
      setChatHistory(prev => [...prev, { role: "model", text: "حدث خطأ، حاول مرة أخرى." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <>
      <RobotVisual
        pos={pos}
        showBubble={showBubble && !chatOpen}
        bubbleText={bubbleText}
        onRobotClick={handleRobotClick}
        onBubbleClick={handleRobotClick}
      />
      {createPortal(
        <AnimatePresence>
          {chatOpen && (
            <ChatWindow
              chatHistory={chatHistory}
              chatInput={chatInput}
              chatLoading={chatLoading}
              onInputChange={setChatInput}
              onSend={handleSendChat}
              onClose={() => setChatOpen(false)}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
