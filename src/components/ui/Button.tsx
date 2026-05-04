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
  const variants = {
    primary: "bg-primary text-white",
    secondary: "bg-secondary text-white",
    green: "bg-accent-green text-white",
    blue: "bg-accent-blue text-white",
    ghost: "bg-transparent border border-glass-border hover:bg-glass-bg"
  };

  const glows = {
    primary: "glow-purple",
    secondary: "glow-blue",
    green: "glow-green",
    blue: "glow-blue",
    ghost: ""
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "px-6 py-3 rounded-2xl font-medium transition-all duration-300 disabled:opacity-50 cursor-pointer",
        variants[variant],
        glow && glows[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
