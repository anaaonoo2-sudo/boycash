/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import i18n from "../lib/i18n";

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export async function askAssistant(prompt: string, history: { role: "user" | "model"; text: string }[] = []) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "X-Title": "BoyCash"
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it:free",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    if (data.error) return `Error: ${data.error.message}`;
    return data.choices[0].message.content;
  } catch (error: any) {
    return i18n.t("ai_connection_error");
  }
}
