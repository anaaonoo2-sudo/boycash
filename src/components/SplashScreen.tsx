import { useEffect, useState } from "react";

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 3000);
    const t2 = setTimeout(() => onDone(), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      transition: "opacity 0.6s ease",
      opacity: fade ? 0 : 1,
      pointerEvents: fade ? "none" : "all"
    }}>
      <iframe
        src="/splash.html"
        style={{ width: "100%", height: "100%", border: "none" }}
        title="splash"
      />
    </div>
  );
}
