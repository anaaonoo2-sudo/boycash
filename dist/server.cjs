"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_vite = require("vite");
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var aiClient = null;
function getAI() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing");
    }
    aiClient = new import_genai.GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" }
      }
    });
  }
  return aiClient;
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "BoyCash", owner: "Bouchibat" });
  });
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { prompt, history } = req.body;
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "AI_KEY_MISSING" });
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          ...(history || []).map((h) => ({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.text }]
          })),
          { role: "user", parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: "You are 'BoyCash AI', a smart and friendly assistant for the BoyCash Rewards app. Your task is to help users understand how to earn points, withdraw earnings (PayPal, Binance, CIH Bank, Cash Plus), and use app features. Your style should be professional, encouraging, and technically expert. Developed by Bouchibat (anaaonoo2@gmail.com). Always be polite and help users maximize their earnings. Always answer in the user's language.",
          temperature: 0.7,
          topP: 0.9
        }
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("AI Server Error:", error);
      res.status(500).json({ error: error.message || "INTERNAL_ERROR" });
    }
  });
  app.post("/api/tasks/complete", (req, res) => {
    const { reward, userId } = req.body;
    res.json({ success: true, userReward: reward * 0.75, adminCommission: reward * 0.25 });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({ server: { middlewareMode: true, hmr: false }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => res.sendFile(import_path.default.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => console.log(`BoyCash Server running on port ${PORT}`));
}
startServer();
//# sourceMappingURL=server.cjs.map
