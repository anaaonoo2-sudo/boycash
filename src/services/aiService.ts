/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import i18n from "../lib/i18n";

const API_KEY = "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";

export async function askAssistant(prompt: string, history: { role: "user" | "model"; text: string }[] = []) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it:free",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI Service Error:", error);
    return i18n.t("ai_connection_error");
  }
}
