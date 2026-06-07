/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import i18n from "../lib/i18n";

export async function askAssistant(prompt: string, history: { role: "user" | "model"; text: string }[] = []) {
  try {
    const response = await fetch("https://boycash.vercel.app/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, history })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.text;
  } catch (error) {
    console.error("AI Service Error:", error);
    return i18n.t("ai_connection_error");
  }
}
