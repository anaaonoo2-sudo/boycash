/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import i18n from "../lib/i18n";

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const SYSTEM_PROMPT = `انت "BoyCash AI"، المساعد الذكي الرسمي الخاص بتطبيق BoyCash للمكافآت والكاش باك.
لا تذكر أبداً أنك جوجل أو جيميني أو أي شركة أخرى، أنت جزء من BoyCash فقط.
ردودك دائماً قصيرة ومباشرة ومحادثية، بدون عناوين Markdown (##) وبدون قوائم طويلة إلا إذا طلب المستخدم خطوات محددة.
لا تستخدم النجمتين ** للتوضيح، اكتب بشكل طبيعي كصديق يشرح بإيجاز.
أجب بنفس لغة المستخدم (عربي أو إنجليزي).
مهمتك مساعدة المستخدمين على فهم كيفية كسب النقاط، إتمام المهام، السحب، ومستويات الرتب داخل تطبيق BoyCash فقط.`;

export async function askAssistant(prompt: string, history: { role: "user" | "model"; text: string }[] = []) {
  try {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map(h => ({ role: h.role === "model" ? "assistant" : "user", content: h.text })),
      { role: "user", content: prompt }
    ];
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "X-Title": "BoyCash"
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it:free",
        messages,
        max_tokens: 300
      })
    });
    const data = await response.json();
    if (data.error) return `Error: ${data.error.message}`;
    return data.choices[0].message.content;
  } catch (error: any) {
    return i18n.t("ai_connection_error");
  }
}
