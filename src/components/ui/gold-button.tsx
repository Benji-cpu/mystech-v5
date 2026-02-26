"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { type ReactNode, type ButtonHTMLAttributes } from "react";

interface GoldButtonProps extends Pick<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function GoldButton({ children, onClick, className, disabled, type }: GoldButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn(
        "bg-gradient-to-r from-[#c9a94e] to-[#daa520] text-black font-semibold rounded-xl px-6 py-3",
        "shadow-lg shadow-[#c9a94e]/20 transition-shadow duration-300",
        "hover:shadow-xl hover:shadow-[#c9a94e]/30",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </motion.button>
  );
}
