/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";
import { askAssistant } from "@/src/services/aiService";
import { X, Send, Loader2, Bot } from "lucide-react";

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
            style={{ willChange: "opacity, transform" }}
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
});

// ─── نافذة المحادثة الجديدة ───
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
  const [kbHeight, setKbHeight] = useState(0);

  // رصد ارتفاع الكيبورد
  useEffect(() => {
    const update = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      const h = window.innerHeight - vv.height - vv.offsetTop;
      setKbHeight(Math.max(h, 0));
    };
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    return () => {
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, []);

  // scroll تلقائي لآخر رسالة
  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory, chatLoading]);

  return (
    // طبقة overlay تغطي الشاشة
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0 12px",
        paddingBottom: kbHeight + 12,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.95 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        style={{
          width: "100%",
          maxWidth: 500,
          height: kbHeight > 0 ? "55vh" : "60vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 24,
          overflow: "hidden",
          background: "linear-gradient(145deg, rgba(15,10,30,0.98), rgba(25,15,50,0.98))",
          border: "1px solid rgba(168,85,247,0.25)",
          boxShadow: "0 -8px 40px rgba(168,85,247,0.2), 0 40px 80px rgba(0,0,0,0.8)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(168,85,247,0.08)",
          flexShrink: 0,
        }}>
          <div style={{
            width: 34, height: 34,
            borderRadius: 10,
            background: "linear-gradient(135deg, #a855f7, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 12px rgba(168,85,247,0.4)",
          }}>
            <Bot size={18} color="white" />
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>
              مساعد BoyCash
            </div>
            <div style={{ color: "#a855f7", fontSize: 10, fontWeight: 600 }}>
              متصل الآن ✦
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto",
              width: 30, height: 30,
              borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "rgba(255,255,255,0.6)",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={messagesRef}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "14px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            minHeight: 0,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {chatHistory.length === 0 && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 8, padding: "20px 0", opacity: 0.5,
            }}>
              <Bot size={32} color="#a855f7" />
              <p style={{ color: "white", fontSize: 12, textAlign: "center", margin: 0 }}>
                اسألني أي شيء عن التطبيق 👋
              </p>
            </div>
          )}

          {chatHistory.map((m, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}>
              <div style={{
                maxWidth: "80%",
                padding: "9px 13px",
                borderRadius: m.role === "user"
                  ? "18px 18px 4px 18px"
                  : "18px 18px 18px 4px",
                background: m.role === "user"
                  ? "linear-gradient(135deg, #a855f7, #7c3aed)"
                  : "rgba(255,255,255,0.07)",
                border: m.role === "user"
                  ? "none"
                  : "1px solid rgba(255,255,255,0.08)",
                color: "white",
                fontSize: 13,
                lineHeight: 1.55,
                wordBreak: "break-word",
                boxShadow: m.role === "user"
                  ? "0 4px 15px rgba(168,85,247,0.3)"
                  : "none",
              }}>
                {m.text}
              </div>
            </div>
          ))}

          {chatLoading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                padding: "10px 14px",
                borderRadius: "18px 18px 18px 4px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <Loader2 size={13} color="#a855f7" style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>جاري الكتابة...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{
          padding: "10px 12px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
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
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14,
              padding: "10px 14px",
              color: "white",
              fontSize: 13,
              outline: "none",
              minWidth: 0,
            }}
          />
          <button
            onClick={onSend}
            disabled={chatLoading || !chatInput.trim()}
            style={{
              width: 40, height: 40,
              borderRadius: 12,
              background: chatLoading || !chatInput.trim()
                ? "rgba(168,85,247,0.2)"
                : "linear-gradient(135deg, #a855f7, #7c3aed)",
              border: "none",
              cursor: chatLoading || !chatInput.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: chatLoading || !chatInput.trim()
                ? "none"
                : "0 4px 12px rgba(168,85,247,0.4)",
              transition: "all 0.2s",
            }}
          >
            <Send size={16} color="white" />
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
