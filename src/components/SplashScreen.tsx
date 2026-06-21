import { useEffect, useState } from "react";
import logo from "../assets/images/regenerated_image_1778432815039.png";

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 2200);
    const t2 = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg, #2a004a 0%, #0a0020 40%, #001040 100%)",
      transition: "opacity 0.6s ease",
      opacity: fade ? 0 : 1,
      pointerEvents: fade ? "none" : "all"
    }}>
      {/* Glow bg */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(180,0,220,0.25) 0%, transparent 70%)"
      }}/>
      {/* Neon ring + icon */}
      <div style={{ position: "relative", marginBottom: 32 }}>
        <div style={{
          position: "absolute", inset: -10, borderRadius: "50%",
          background: "conic-gradient(from 0deg, #ff00cc, #aa00ff, #4400ff, #aa00ff, #ff00cc)",
          filter: "blur(8px)", opacity: 0.9,
          animation: "spin 3s linear infinite"
        }}/>
        <div style={{
          position: "absolute", inset: -4, borderRadius: "50%",
          background: "#0a0020", zIndex: 1
        }}/>
        <img src={logo} style={{
          position: "relative", zIndex: 2,
          width: 180, height: 180, borderRadius: "50%", objectFit: "cover"
        }}/>
      </div>
      <div style={{
        position: "relative", zIndex: 2,
        fontSize: 36, fontWeight: 800, color: "#fff",
        letterSpacing: "0.1em", textTransform: "uppercase",
        textShadow: "0 0 20px rgba(200,0,255,0.9), 0 0 40px rgba(200,0,255,0.5)"
      }}>BoyCash</div>
      <div style={{
        position: "relative", zIndex: 2,
        fontSize: 13, color: "rgba(200,150,255,0.7)",
        letterSpacing: "0.2em", marginTop: 10
      }}>EARN · REWARDS · CASH</div>
      {/* Dots */}
      <div style={{ display: "flex", gap: 8, marginTop: 40, position: "relative", zIndex: 2 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#cc00ff", boxShadow: "0 0 8px #cc00ff",
            animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite`
          }}/>
        ))}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%,80%,100% { transform: scale(1); opacity: 0.5; }
          40% { transform: scale(1.6); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
