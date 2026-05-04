/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { GoogleGenAI } from "@google/genai";
import i18n from "../lib/i18n";

let genAI: GoogleGenAI | null = null;

const getGenAI = () => {
  if (genAI) return genAI;

  // Prefer process.env as per platform guidelines
  let key = process.env.GEMINI_API_KEY;
  
  // Fallback to import.meta.env for local dev flexibility
  if (!key || key === "undefined" || key === "") {
    key = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  }

  // Final check - only block truly empty/undefined values
  if (!key || key === "undefined" || key === "") {
    return null;
  }

  genAI = new GoogleGenAI({ apiKey: key });
  return genAI;
};

export async function askAssistant(prompt: string, history: { role: "user" | "model"; text: string }[] = []) {
  const ai = getGenAI();
  
  if (!ai) {
    console.warn("Gemini API Key is missing or invalid.");
    return i18n.t("ai_unavailable");
  }

  try {
    const formattedHistory = history
      .filter((msg, index) => {
        if (index === 0 && msg.role === "model") return false;
        return true;
      })
      .map(h => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text }]
      }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...formattedHistory,
        { role: "user", parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: "You are 'BoyCash AI', a smart and friendly assistant for the BoyCash Rewards app. Your task is to help users understand how to earn points, withdraw earnings (PayPal, Binance, CIH Bank, Cash Plus), and use app features. Your style should be professional, encouraging, and technically expert. Developed by Bouchibat (anaaonoo2@gmail.com). Always be polite and help users maximize their earnings. Always answer in the user's language. If a user asks how to earn points, tell them about Earn tasks and the Games section.",
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const result = response.text;
    if (!result) throw new Error("No response text from AI");
    
    return result;
  } catch (error: any) {
    console.error("AI Error:", error);
    
    if (error?.message?.includes("API_KEY_INVALID") || error?.status === 403) {
      return i18n.t("ai_connection_error");
    }
    
    return i18n.t("ai_process_error");
  }
}
