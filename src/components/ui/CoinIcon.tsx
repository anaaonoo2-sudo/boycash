/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { cn } from "@/src/lib/utils";

interface CoinIconProps {
  className?: string;
  size?: number;
}

export default function CoinIcon({ className, size = 24 }: CoinIconProps) {
  return (
    <div 
      className={cn("relative flex items-center justify-center shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {/* Outer Glow & Glass Rim */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 via-secondary/40 to-transparent blur-[4px] opacity-60 scale-110" />
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-[1px] opacity-50" />
      
      {/* Coin Body */}
      <div className="absolute inset-[10%] rounded-full bg-gradient-to-br from-[#fbbf24] via-[#d97706] to-[#92400e] shadow-[0_4px_12px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.5)] flex items-center justify-center border border-white/30">
        
        {/* Mirror Reflection Overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50 transform -rotate-12" />
        
        {/* Symbol 'B' with deeper shadow */}
        <span 
          className="font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)] italic select-none z-10"
          style={{ fontSize: size * 0.55 }}
        >
          B
        </span>
      </div>

      {/* Luxury Ambient Lighting (Glass Reflection) */}
      <div className="absolute top-[10%] left-[20%] w-[40%] h-[20%] rounded-full bg-white/40 blur-[3px] rotate-[35deg] z-20" />
      <div className="absolute bottom-[10%] right-[20%] w-[30%] h-[10%] rounded-full bg-white/20 blur-[2px] -rotate-[15deg] z-20" />
    </div>
  );
}
