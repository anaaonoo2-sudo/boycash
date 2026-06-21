/* Developed & Owned by Bouchibat - bouchibattauomi@gmail.com - 2026 */
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
    primary: "bg-gradient-to-br from-primary via-purple-600 to-indigo-700 text-white shadow-[0_10px_25px_-5px_rgba(168,85,247,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-primary/20",
    secondary: "bg-gradient-to-br from-secondary via-blue-600 to-blue-800 text-white shadow-[0_10px_25px_-5px_rgba(59,130,246,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-secondary/20",
    green: "bg-gradient-to-br from-accent-green via-emerald-600 to-teal-800 text-white shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-accent-green/20",
    blue: "bg-gradient-to-br from-accent-blue via-sky-600 to-sky-800 text-white shadow-[0_10px_25px_-5px_rgba(14,165,233,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-accent-blue/20",
    ghost: "bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-xl"
  };

  const glows = {
    primary: "shadow-[0_0_40px_-5px_rgba(168,85,247,0.5)]",
    secondary: "shadow-[0_0_40px_-5px_rgba(59,130,246,0.5)]",
    green: "shadow-[0_0_40px_-5px_rgba(16,185,129,0.5)]",
    blue: "shadow-[0_0_40px_-5px_rgba(14,165,233,0.5)]",
    ghost: ""
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01, y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
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
