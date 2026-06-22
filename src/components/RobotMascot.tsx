/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";
import { askAssistant } from "@/src/services/aiService";
import { X, Send, Loader2 } from "lucide-react";

import robotImg from "@/src/assets/robot/robot_full.png";

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

export default function RobotMascot() {
  const location = useLocation();

  const [pos, setPos] = useState({ x: 0, y: 0 });

  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "model"; text: string }[]>([]);

  const roam = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const robotW = 90;
    const robotH = 135;
    const margin = 20;
    const navBarSafe = 140;
    const headerSafe = 90;

    const newX = margin + Math.random() * (vw - robotW - margin * 2);
    const newY = headerSafe + Math.random() * (vh - robotH - navBarSafe - headerSafe);

    setPos({ x: newX, y: newY });
  }, []);

  useEffect(() => {
    roam();
    const interval = setInterval(() => {
      if (!chatOpen) roam();
    }, 8000);
    return () => clearInterval(interval);
  }, [roam, chatOpen]);

  useEffect(() => {
    setBubbleText(getTipForPath(location.pathname));
    setShowBubble(true);
    const t = setTimeout(() => setShowBubble(false), 4500);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const handleRobotClick = () => {
    if (chatOpen) return;
    setBubbleText(getTipForPath(location.pathname));
    setShowBubble(true);
  };

  const handleOpenChat = () => {
    setShowBubble(false);
    setChatOpen(true);
  };

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
      <motion.div
        className="fixed z-[65] pointer-events-none"
        style={{ width: 90, height: 135, left: 0, top: 0 }}
        initial={{ x: pos.x, y: pos.y }}
        animate={{ x: pos.x, y: pos.y }}
        transition={{ type: "spring", stiffness: 40, damping: 15, duration: 2 }}
      >
        <AnimatePresence>
          {showBubble && !chatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute -top-20 left-1/2 -translate-x-1/2 w-44 pointer-events-auto"
            >
              <div
                onClick={handleOpenChat}
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
          onClick={handleRobotClick}
          animate={{
            y: [0, -10, 0],
            rotate: [-4, 4, -4],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src={robotImg}
            alt="BoyCash Robot"
            className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(168,85,247,0.5)] select-none"
            draggable={false}
          />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-24 left-4 right-4 z-[80] bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl max-h-[50vh] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-white font-bold text-sm">مساعد BoyCash</span>
              <button onClick={() => setChatOpen(false)} className="text-white/60 hover:text-white">
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
                >
                  {m.text}
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <Loader2 size={12} className="animate-spin" /> جاري الكتابة...
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center gap-2 p-3 border-t border-white/10"
            >
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="اكتب سؤالك..."
                className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
