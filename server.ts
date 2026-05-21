/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";

// Lazy initialize Gemini AI
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing");
    }
    aiClient = new GoogleGenAI({ 
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "BoyCash", owner: "Bouchibat" });
  });

  // Gemini AI Route
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { prompt, history } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "AI_KEY_MISSING" });
      }

      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...(history || []).map((h: any) => ({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.text }]
          })),
          { role: "user", parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: "You are 'BoyCash AI', a smart and friendly assistant for the BoyCash Rewards app. Your task is to help users understand how to earn points, withdraw earnings (PayPal, Binance, CIH Bank, Cash Plus), and use app features. Your style should be professional, encouraging, and technically expert. Developed by Bouchibat (anaaonoo2@gmail.com). Always be polite and help users maximize their earnings. Always answer in the user's language. If a user asks how to earn points, tell them about Earn tasks and the Games section.",
          temperature: 0.7,
          topP: 0.9,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Server Error:", error);
      res.status(500).json({ error: error.message || "INTERNAL_ERROR" });
    }
  });

  // Admin Profit Utility Endpoint (Simulation for tasks)
  app.post("/api/tasks/complete", (req, res) => {
    const { reward, userId } = req.body;
    const adminCommission = reward * 0.25;
    const userReward = reward * 0.75;
    
    console.log(`[BoyCash] Task completion: User ${userId} earns ${userReward}, Owner (Bouchibat) earns ${adminCommission}`);
    
    res.json({
      success: true,
      userReward,
      adminCommission,
      message: "Task processed with 25% admin cut."
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false, 
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BoyCash Server running on http://localhost:${PORT}`);
  });
}

startServer();
