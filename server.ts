/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "BoyCash", owner: "Bouchibat" });
  });

  // Admin Profit Utility Endpoint (Simulation for tasks)
  app.post("/api/tasks/complete", (req, res) => {
    const { reward, userId } = req.body;
    const adminCommission = reward * 0.25;
    const userReward = reward * 0.75;
    
    // In a real production app, we would process this in Firestore Admin SDK
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
        hmr: false, // Explicitly disable HMR here
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
