/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { useState, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { askAssistant } from "@/src/services/aiService";
import { X, Send, Loader2, Bot } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

interface ChatWindowProps {
  open: boolean;
  onClose: () => void;
}

export default memo(function ChatWindow({ open, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [kbHeight, setKbHeight] = useState(0);
  const messagesRef = useRef<HTMLDivElement>(null);

  // رصد الكيبورد
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const h = window.innerHeight - vv.height;
      setKbHeight(Math.max(h, 0));
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      setKbHeight(0);
    };
  }, [open]);

  // scroll لآخر رسالة
  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const updated: Message[] = [...messages, { role: "user", text }];
    setMessages(updated);
    setLoading(true);
    try {
      const response = await askAssistant(text, updated);
      setMessages(prev => [...prev, { role: "model", text: response }]);
    } catch {
      setMessages(prev => [...prev, { role: "model", text: "حدث خطأ، حاول مرة أخرى." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 998,
              background: "rgba(0,0,0,0.55)",
            }}
          />

          {/* Chat panel */}
          <motion.div
            key="panel"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            style={{
              position: "fixed",
              left: 12,
              right: 12,
              bottom: kbHeight + 12,
              zIndex: 999,
              height: "58vh",
              display: "flex",
              flexDirection: "column",
              borderRadius: 24,
              overflow: "hidden",
              background: "linear-gradient(160deg, #0f0a1e 0%, #1a0f35 100%)",
              border: "1px solid rgba(168,85,247,0.2)",
              boxShadow: "0 -4px 30px rgba(168,85,247,0.15), 0 20px 60px rgba(0,0,0,0.8)",
              transition: "bottom 0.22s ease",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(168,85,247,0.07)",
              flexShrink: 0,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: "linear-gradient(135deg, #a855f7, #6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 10px rgba(168,85,247,0.35)",
              }}>
                <Bot size={17} color="white" />
              </div>
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 13 }}>مساعد BoyCash</div>
                <div style={{ color: "#a855f7", fontSize: 10, fontWeight: 600 }}>متصل الآن ✦</div>
              </div>
              <button onClick={onClose} style={{
                marginLeft: "auto", width: 28, height: 28, borderRadius: 8,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "rgba(255,255,255,0.5)",
              }}>
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div ref={messagesRef} style={{
              flex: 1, overflowY: "auto", overflowX: "hidden",
              padding: "12px 12px", display: "flex",
              flexDirection: "column", gap: 8, minHeight: 0,
            }}>
              {messages.length === 0 && (
                <div style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 8, opacity: 0.45,
                }}>
                  <Bot size={30} color="#a855f7" />
                  <p style={{ color: "white", fontSize: 12, textAlign: "center", margin: 0 }}>
                    اسألني أي شيء عن التطبيق 👋
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}>
                  <div style={{
                    maxWidth: "80%", padding: "8px 12px",
                    borderRadius: m.role === "user" ? "16px 16px 3px 16px" : "16px 16px 16px 3px",
                    background: m.role === "user"
                      ? "linear-gradient(135deg, #a855f7, #7c3aed)"
                      : "rgba(255,255,255,0.07)",
                    border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.07)",
                    color: "white", fontSize: 13, lineHeight: 1.5,
                    wordBreak: "break-word",
                    boxShadow: m.role === "user" ? "0 3px 12px rgba(168,85,247,0.25)" : "none",
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{
                    padding: "8px 12px", borderRadius: "16px 16px 16px 3px",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <Loader2 size={12} color="#a855f7" className="animate-spin" />
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>جاري الكتابة...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{
              padding: "8px 10px", borderTop: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(0,0,0,0.15)", display: "flex", gap: 7, flexShrink: 0,
            }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSend(); } }}
                placeholder="اكتب سؤالك..."
                enterKeyHint="send"
                style={{
                  flex: 1, background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 13,
                  padding: "9px 13px", color: "white", fontSize: 13,
                  outline: "none", minWidth: 0,
                }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{
                  width: 38, height: 38, borderRadius: 11, border: "none",
                  background: loading || !input.trim() ? "rgba(168,85,247,0.2)" : "linear-gradient(135deg, #a855f7, #7c3aed)",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: !loading && input.trim() ? "0 3px 10px rgba(168,85,247,0.35)" : "none",
                  transition: "all 0.18s",
                }}
              >
                <Send size={15} color="white" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
