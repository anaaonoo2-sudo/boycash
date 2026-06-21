/* Developed & Owned by Bouchibat - bouchibattauomi@gmail.com - 2026 */
import { ReactNode, HTMLAttributes } from "react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export default function GlassCard({ children, className, animate = true, onClick, ...props }: any) {
  const Component = animate ? motion.div : "div";
  
  return (
    <Component
      initial={animate ? { opacity: 0, y: 10 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      className={cn(
        "glass-card p-6 transition-all duration-500",
        className
      )}
      {...(props as any)}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      {children}
    </Component>
  );
}
