/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { useState, useEffect, useRef, useCallback, memo } from "react";
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

// ─── الروبوت البصري — memo يمنع إعادة الرسم عند فتح الشات ───
const RobotVisual = memo(function RobotVisual({
  pos,
  showBubble,
  bubbleText,
  onRobotClick,
  onBubbleClick,
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
        width: 80,
        height: 110,
        left: pos.x,
        top: pos.y,
        // transition سلس بدون spring حتى لا يومض
        transition: "left 2s cubic-bezier(0.4,0,0.2,1), top 2s cubic-bezier(0.4,0,0.2,1)",
        willChange: "left, top",
      }}
    >
      {/* فقاعة الكلام */}
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
              style={{ unicodeBidi: "plaintext" }}
            >
              {bubbleText}
            </div>
            <div className="w-3 h-3 bg-white/95 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* جسم الروبوت */}
      <motion.div
        className="relative w-full h-full pointer-events-auto cursor-pointer"
        onClick={onRobotClick}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ willChange: "transform" }}
      >
        <motion.img
          src={headImg}
          alt=""
          draggable={false}
          className="absolute left-1/2 -translate-x-1/2 top-0 w-[60px] drop-shadow-lg select-none"
          animate={{ rotate: [-6, 6, -6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 90%", willChange: "transform" }}
        />
        <motion.img
          src={armLeftImg}
          alt=""
          draggable={false}
          className="absolute top-[52px] left-[16px] w-[15px] drop-shadow-md select-none z-0"
          animate={{ rotate: [0, -20, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
          style={{ transformOrigin: "50% 0%", willChange: "transform" }}
        />
        <motion.img
          src={armRightImg}
          alt=""
          draggable={false}
          className="absolute top-[52px] right-[16px] w-[15px] drop-shadow-md select-none z-0"
          animate={{ rotate: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 0%", willChange: "transform" }}
        />
        <img
          src={bodyImg}
          alt=""
          draggable={false}
          className="absolute left-1/2 -translate-x-1/2 top-[48px] w-[40px] drop-shadow-lg select-none z-10"
        />
        <motion.img
          src={legLeftImg}
          alt=""
          draggable={false}
          className="absolute top-[69px] left-[22px] w-[15px] drop-shadow-md select-none"
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 0%", willChange: "transform" }}
        />
        <motion.img
          src={legRightImg}
          alt=""
          draggable={false}
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

// ─── نافذة المحادثة — معزولة تماماً، لا تؤثر على التطبيق ───
const ChatWindow = memo(function ChatWindow({
  chatHistory,
  chatInput,
  chatLoading,
  onInputChange,
  onSend,
  onClose,
}: {
  chatHistory: { role: "user" | "model"; text: string }[];
  chatInput: string;
  chatLoading: boolean;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onClose: () => void;
}) {
  const [bottomOffset, setBottomOffset] = useState(8);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      if (!window.visualViewport) return;
      const kbHeight = window.innerHeight - window.visualViewport.height;
      setBottomOffset(Math.max(kbHeight, 0) + 8);
    };
    window.visualViewport?.addEventListener("resize", update);
    update();
    return () => window.visualViewport?.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      // fixed = منفصل تماماً عن باقي التطبيق، لا يرفعه أبداً
      style={{ bottom: bottomOffset, position: "fixed" }}
      className="left-4 right-4 z-[90] bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl max-h-[45dvh] flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-white font-bold text-sm">مساعد BoyCash</span>
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {chatHistory.length === 0 && (
          <p className="text-white/50 text-xs">اسألني أي شيء عن التطبيق 👋</p>
        )}
        {chatHistory.map((m, i) => (
          <div
            key={i}
            className={`text-xs px-3 py-2 rounded-xl max-w-[85%] ${
              m.role === "user"
                ? "bg-primary text-white ml-auto"
                : "bg-white/10 text-gray-100"
            }`}
            style={{ unicodeBidi: "plaintext" }}
          >
            {m.text}
          </div>
        ))}
        {chatLoading && (
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <Loader2 size={12} className="animate-spin" /> جاري الكتابة...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center gap-2 p-3 border-t border-white/10">
        <input
          value={chatInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSend(); } }}
          placeholder="اكتب سؤالك..."
          enterKeyHint="send"
          className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none"
        />
        <button
          onClick={onSend}
          disabled={chatLoading || !chatInput.trim()}
          className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
    </motion.div>
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
      </AnimatePresence>
    </>
  );
}
