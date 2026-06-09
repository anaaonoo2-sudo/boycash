/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import GlassCard from "@/src/components/ui/GlassCard";
import Button from "@/src/components/ui/Button";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { askAssistant } from "@/src/services/aiService";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function Assistant() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: "model", text: t("assistant_welcome") }]);
    }
  }, [t, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = useCallback(async (customInput?: string) => {
    const textToSend = customInput || input.trim();
    if (!textToSend || isLoading) return;

    if (!customInput) setInput("");

    const updatedMessages = [...messages, { role: "user", text: textToSend } as Message];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const historyForAI = updatedMessages
        .filter((_, index) => index > 0 || updatedMessages[0].role !== "model")
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const response = await askAssistant(textToSend, historyForAI);
      setMessages(prev => [...prev, { role: "model", text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "model", text: t("error_occurred") }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, t]);

  useEffect(() => {
    const state = location.state as { initialQuery?: string };
    if (state?.initialQuery) {
      handleSend(state.initialQuery);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate, handleSend]);

  return (
    <div className="flex flex-col h-[calc(100vh-210px)] space-y-4" dir={isRtl ? "rtl" : "ltr"}>
      <header className="text-center shrink-0">
        <h1 className="text-2xl font-black neon-text-blue uppercase tracking-tighter">{t("ask_ai")}</h1>
        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest leading-none">{t("ai_powered")}</p>
      </header>

      <div className="flex-1 flex flex-col min-h-0 relative">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4 scrollbar-hide relative z-10"
        >
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "flex gap-3",
                m.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-lg",
                m.role === 'user' ? "bg-primary text-white" : "bg-white/10 text-secondary"
              )}>
                {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={cn(
                "px-4 py-3 rounded-2xl text-[13px] max-w-[85%] leading-relaxed shadow-lg",
                m.role === 'user'
                  ? "bg-primary text-white font-medium shadow-primary/20"
                  : "bg-white/10 text-gray-100 border border-white/5 backdrop-blur-md"
              )}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 animate-pulse"
            >
              <div className="w-9 h-9 rounded-2xl bg-white/10 text-secondary flex items-center justify-center border border-white/10">
                <Bot size={18} />
              </div>
              <div className="bg-white/5 text-gray-400 px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/5">
                <Loader2 size={14} className="animate-spin text-primary" />
                <span className="text-[11px] font-bold text-white/50">{t("thinking")}</span>
              </div>
            </motion.div>
          )}
        </div>

        <div className={cn(
          "mt-2 space-y-3 relative z-30 shrink-0 transition-all duration-300 ease-out",
          "mb-0 translate-y-0 scale-100"
        )}>
          <div className={cn(
            "flex gap-2 overflow-x-auto pb-1 scrollbar-hide transition-opacity",
            isFocused ? "opacity-100" : "opacity-0 h-0 pointer-events-none"
          )}>
            {[t("q_withdraw"), t("q_points"), t("q_min")].map((text) => (
              <button
                key={text}
                onClick={() => handleSend(text)}
                className="whitespace-nowrap px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-[11px] font-bold text-white/80 hover:bg-white/20 transition-all active:scale-95"
              >
                {text}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className={cn(
              "bg-white rounded-2xl p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border transition-colors",
              isFocused ? "border-primary" : "border-white/20"
            )}
          >
            <div className="flex gap-2 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setIsFocused(false), 300);
                  }}
                  placeholder={t("type_question")}
                  className={cn(
                    "w-full bg-transparent border-none rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all font-medium",
                    isRtl ? "text-right" : "text-left"
                  )}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-12 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg transition-all active:scale-95 flex items-center justify-center p-0 shrink-0 cursor-pointer relative z-50"
              >
                {isLoading ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : (
                  <Send size={22} className={cn("rotate-0", isRtl ? "scale-x-[-1]" : "")} />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="text-center opacity-30 text-[9px] font-black uppercase tracking-[0.3em] py-2 shrink-0">
    </div>
  );
        }
                
