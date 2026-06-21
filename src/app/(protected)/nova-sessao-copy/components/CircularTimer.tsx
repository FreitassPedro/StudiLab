"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CircularTimerProps {
  size?: number;
  stroke?: number;
  progress?: number;
  color?: string;
  isRunning?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function CircularTimer({
  size = 280,
  stroke = 12,
  progress = 0,
  color = "hsl(var(--primary))",
  isRunning = false,
  children,
  className,
}: CircularTimerProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 drop-shadow-[0_0_15px_rgba(0,0,0,0.1)]"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={stroke}
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease",
            filter: isRunning ? `drop-shadow(0 0 8px ${color})` : 'none'
          }}
        />
      </svg>

      {/* Pulse Effect */}
      {isRunning && (
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-20 pointer-events-none"
          style={{
            backgroundColor: color,
            animationDuration: '2s'
          }}
        />
      )}

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
        {children}
      </div>
    </div>
  );
}
