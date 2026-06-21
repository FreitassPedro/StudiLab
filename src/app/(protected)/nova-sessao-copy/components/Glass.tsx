"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  style?: React.CSSProperties;
}

export function Glass({ children, className, accentColor, style }: GlassProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-background before:absolute before:inset-0 before:bg-card/40 before:pointer-events-none before:rounded-2xl transition-all duration-300",
        className
      )}
      style={{
        boxShadow: accentColor
          ? `0 10px 40px -18px ${accentColor}66`
          : undefined,
        borderColor: accentColor ? `${accentColor}10` : undefined,
        ...style
      }}
    >
      {children}
    </div>
  );
}
