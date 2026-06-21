import { useEffect, useState } from "react";
import logo from "../assets/images/regenerated_image_1778432815039.png";
import bg from "../assets/images/regenerated_image_1778432815039.png";

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fade, setFade] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const colors = ['#ff00cc','#cc00ff','#8800ff','#4499ff','#ff44aa'];
    const p = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: Math.random() * 5 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      tx: (Math.random() - 0.5) * 200,
      ty: (Math.random() - 0.5) * 300,
      dur: Math.random() * 2 + 1.5,
      delay: Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setParticles(p);
    const t1 = setTimeout(() => setFade(true), 2500);
    const t2 = setTimeout(() => onDone(), 3100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#000", overflow: "hidden",
      transition: "opacity 0.6s ease",
      opacity: fade ? 0 : 1,
      pointerEvents: fade ? "none" : "all",
      fontFamily: "'Segoe UI', Arial, sans-serif"
    }}>
      <style>{`
        @keyframes bgFade { to { opacity: 1; } }
        @keyframes iconPop {
          0% { opacity: 0; transform: scale(0.4) rotate(-10deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes textGlow {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes glowPulse {
          from { filter: blur(6px) brightness(1); }
          to   { filter: blur(10px) brightness(1.4); }
        }
        @keyframes dotBounce {
          0%,80%,100% { transform: scale(1); opacity: 0.6; }
          40% { transform: scale(1.6); opacity: 1; }
        }
        @keyframes particleFly {
          0%   { opacity: 0; transform: translate(0,0) scale(0); }
          20%  { opacity: 0.9; }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.3); }
        }
        .splash-bg { animation: bgFade 0.8s ease-out forwards; opacity: 0; }
        .splash-icon { animation: iconPop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.4s both; opacity: 0; }
        .splash-name { animation: textGlow 0.6s ease-out 0.9s both; opacity: 0; }
        .splash-tag  { animation: textGlow 0.6s ease-out 1.1s both; opacity: 0; }
        .splash-dots { animation: textGlow 0.4s ease-out 1.4s both; opacity: 0; }
        .splash-dot0 { animation: dotBounce 1.2s ease-in-out 0s infinite; }
        .splash-dot1 { animation: dotBounce 1.2s ease-in-out 0.2s infinite; }
        .splash-dot2 { animation: dotBounce 1.2s ease-in-out 0.4s infinite; }
        .splash-ring-before {
          animation: spin 3s linear infinite, glowPulse 1.5s ease-in-out infinite alternate;
        }
      `}</style>

      {/* Background */}
      <div className="splash-bg" style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover", backgroundPosition: "center"
      }}/>

      {/* Glow overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 60% 40% at 50% 50%, rgba(180,0,200,0.2) 0%, transparent 70%),
          radial-gradient(ellipse 80% 30% at 30% 80%, rgba(120,0,180,0.12) 0%, transparent 60%)`
      }}/>

      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute",
          width: p.size, height: p.size,
          borderRadius: "50%",
          left: `${p.left}%`, top: `${p.top}%`,
          background: p.color,
          boxShadow: `0 0 ${p.size*2}px ${p.color}`,
          opacity: 0,
          animation: `particleFly ${p.dur}s ease-out ${p.delay}s infinite`,
          ["--tx" as any]: `${p.tx}px`,
          ["--ty" as any]: `${p.ty}px`,
        }}/>
      ))}

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>

        {/* Icon with neon ring */}
        <div className="splash-icon" style={{ position: "relative", width: "min(240px, 55vw)", height: "min(240px, 55vw)" }}>
          <div className="splash-ring-before" style={{
            position: "absolute", inset: -8, borderRadius: "50%",
            background: "conic-gradient(from 0deg, #ff00cc, #aa00ff, #4400ff, #aa00ff, #ff00cc)",
            filter: "blur(6px)", opacity: 0.85
          }}/>
          <div style={{ position: "absolute", inset: -3, borderRadius: "50%", background: "#100020", zIndex: 1 }}/>
          <img src={logo} style={{
            position: "relative", zIndex: 2,
            width: "100%", height: "100%",
            borderRadius: "50%", objectFit: "cover"
          }}/>
        </div>

        <div className="splash-name" style={{
          fontSize: "clamp(2rem, 8vw, 3.2rem)", fontWeight: 800,
          letterSpacing: "0.08em", color: "#fff", textTransform: "uppercase",
          textShadow: "0 0 20px rgba(200,0,255,0.9), 0 0 40px rgba(200,0,255,0.5), 0 0 80px rgba(160,0,200,0.3)"
        }}>BoyCash</div>

        <div className="splash-tag" style={{
          fontSize: "clamp(0.75rem, 3vw, 1rem)",
          color: "rgba(200,150,255,0.75)", letterSpacing: "0.22em", textTransform: "uppercase"
        }}>Earn · Rewards · Cash</div>

        <div className="splash-dots" style={{ display: "flex", gap: 8 }}>
          {[0,1,2].map(i => (
            <div key={i} className={`splash-dot${i}`} style={{
              width: 7, height: 7, borderRadius: "50%",
              background: i===0?"#cc00ff":i===1?"#aa00ee":"#8800dd",
              boxShadow: `0 0 8px ${i===0?"#cc00ff":i===1?"#aa00ee":"#8800dd"}`
            }}/>
          ))}
        </div>
      </div>
    </div>
  );
}
