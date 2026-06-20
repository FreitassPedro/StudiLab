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
        "relative rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl transition-all duration-300",
        className
      )}
      style={{
        boxShadow: accentColor
          ? `0 10px 40px -18px ${accentColor}66`
          : undefined,
        borderColor: accentColor ? `${accentColor}44` : undefined,
        ...style
      }}
    >
      {children}
    </div>
  );
}
