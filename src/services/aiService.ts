/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import i18n from "../lib/i18n";

const API_KEY = "AQ.Ab8RN6KIlZuEPnEZCIPhis0XH7v71TK9MAbNvCi2KoOAW2fRvw";
const PROJECT_ID = "1010107251708";

export async function askAssistant(prompt: string, history: { role: "user" | "model"; text: string }[] = []) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        })
      }
    );
    const data = await response.json();
    if (data.error) {
      console.error("API Error:", data.error);
      return i18n.t("ai_connection_error");
    }
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("AI Service Error:", error);
    return i18n.t("ai_connection_error");
  }
}
