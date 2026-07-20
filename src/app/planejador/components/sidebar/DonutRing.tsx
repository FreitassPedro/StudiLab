"use client";

interface DonutRingProps {
    value: number;
    size?: number;
    stroke?: number;
    color: string;
    label: string;
    sublabel: string;
}

export function DonutRing({
    value,
    size = 72,
    stroke = 7,
    color,
    label,
    sublabel,
}: DonutRingProps) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (Math.min(value, 100) / 100) * circ;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                        stroke="currentColor" strokeWidth={stroke} className="text-muted/50" />
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                        stroke={color} strokeWidth={stroke} strokeLinecap="round"
                        strokeDasharray={`${dash} ${circ}`}
                        style={{ transition: "stroke-dasharray 0.6s ease" }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold" style={{ color }}>{value}%</span>
                </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="text-[9px] text-muted-foreground/60">{sublabel}</p>
        </div>
    );
}
