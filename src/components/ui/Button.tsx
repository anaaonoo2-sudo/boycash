/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { ButtonHTMLAttributes, ReactNode, MouseEventHandler } from "react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "green" | "blue" | "ghost";
  glow?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export default function Button({ 
  variant = "primary", 
  glow = false, 
  children, 
  className, 
  ...props 
}: any) {
  const baseStyles = "relative px-8 py-4 rounded-[1.25rem] font-bold text-sm uppercase tracking-widest transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden group";
  
  const variants = {
    primary: "bg-gradient-to-br from-primary to-[#7c2d12] text-white shadow-[0_10px_20px_-5px_rgba(168,85,247,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]",
    secondary: "bg-gradient-to-br from-secondary to-[#1e3a8a] text-white shadow-[0_10px_20px_-5px_rgba(59,130,246,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]",
    green: "bg-gradient-to-br from-accent-green to-[#064e3b] text-white shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]",
    blue: "bg-gradient-to-br from-accent-blue to-[#0c4a6e] text-white shadow-[0_10px_20px_-5px_rgba(14,165,233,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]",
    ghost: "bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20"
  };

  const glows = {
    primary: "shadow-[0_0_50px_-10px_rgba(168,85,247,0.6)]",
    secondary: "shadow-[0_0_50px_-10px_rgba(59,130,246,0.6)]",
    green: "shadow-[0_0_50px_-10px_rgba(16,185,129,0.6)]",
    blue: "shadow-[0_0_50px_-10px_rgba(14,165,233,0.6)]",
    ghost: ""
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96, y: 1 }}
      whileHover={{ scale: 1.02, y: -1 }}
      className={cn(
        baseStyles,
        variants[variant],
        glow && glows[variant],
        className
      )}
      {...props}
    >
      {/* Glint effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
