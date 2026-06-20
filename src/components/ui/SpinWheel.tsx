/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { useState } from "react";
import { motion } from "motion/react";

interface Prize {
  label: string;
  amount: number;
  color: string;
}

const PRIZES: Prize[] = [
  { label: "5", amount: 5, color: "#22c55e" },
  { label: "10", amount: 10, color: "#a855f7" },
  { label: "15", amount: 15, color: "#3b82f6" },
  { label: "20", amount: 20, color: "#eab308" },
  { label: "25", amount: 25, color: "#ec4899" },
  { label: "30", amount: 30, color: "#06b6d4" },
  { label: "40", amount: 40, color: "#f97316" },
  { label: "50", amount: 50, color: "#8b5cf6" },
];

const SEGMENT_ANGLE = 360 / PRIZES.length;

interface SpinWheelProps {
  onWin: (amount: number) => void;
  disabled?: boolean;
}

export default function SpinWheel({ onWin, disabled }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    if (spinning || disabled) return;
    setSpinning(true);

    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const targetSegmentCenter = prizeIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const fullSpins = 5 * 360;
    const finalRotation = rotation + fullSpins + (360 - targetSegmentCenter) - (rotation % 360);

    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      onWin(PRIZES[prizeIndex].amount);
    }, 3200);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-64 h-64">
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 drop-shadow-lg">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[22px] border-l-transparent border-r-transparent border-t-white" />
        </div>

        <motion.svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-2xl"
          animate={{ rotate: rotation }}
          transition={{ duration: 3.2, ease: [0.17, 0.67, 0.32, 1] }}
        >
          {PRIZES.map((prize, i) => {
            const startAngle = i * SEGMENT_ANGLE;
            const endAngle = startAngle + SEGMENT_ANGLE;
            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (endAngle - 90) * (Math.PI / 180);
            const x1 = 100 + 95 * Math.cos(startRad);
            const y1 = 100 + 95 * Math.sin(startRad);
            const x2 = 100 + 95 * Math.cos(endRad);
            const y2 = 100 + 95 * Math.sin(endRad);
            const midAngle = startAngle + SEGMENT_ANGLE / 2;
            const midRad = (midAngle - 90) * (Math.PI / 180);
            const labelX = 100 + 65 * Math.cos(midRad);
            const labelY = 100 + 65 * Math.sin(midRad);

            return (
              <g key={i}>
                <path
                  d={`M100,100 L${x1},${y1} A95,95 0 0,1 ${x2},${y2} Z`}
                  fill={prize.color}
                  stroke="#0a0a0f"
                  strokeWidth="1.5"
                />
                <text
                  x={labelX}
                  y={labelY}
                  fill="white"
                  fontSize="14"
                  fontWeight="900"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${midAngle}, ${labelX}, ${labelY})`}
                >
                  {prize.label}
                </text>
              </g>
            );
          })}
          <circle cx="100" cy="100" r="14" fill="#0a0a0f" stroke="#a855f7" strokeWidth="2" />
        </motion.svg>
      </div>

      <button
        onClick={spin}
        disabled={spinning || disabled}
        className="w-full py-4 rounded-xl text-xs font-black uppercase bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
      >
        {spinning ? "..." : "SPIN NOW"}
      </button>
    </div>
  );
}
