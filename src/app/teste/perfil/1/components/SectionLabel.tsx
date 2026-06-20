"use client";

import React from "react";

interface SectionLabelProps {
  children: React.ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
      {children}
      <span className="h-px flex-1 bg-white/[0.07]" />
    </div>
  );
}
