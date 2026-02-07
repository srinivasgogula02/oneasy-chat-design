"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface RadarChartProps {
    data: { label: string; value: number }[];
    maxVal?: number;
}

// Fixed size chart - no dynamic sizing to prevent overflow
const CHART_SIZE = 250;
const CENTER = CHART_SIZE / 2;
const RADIUS = 80; // Small radius with large padding for labels

export function RadarChart({ data, maxVal = 10 }: RadarChartProps) {
    // Calculate points for data polygon
    const points = useMemo(() => {
        if (data.length === 0) return "";
        return data.map((item, i) => {
            const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
            const r = (item.value / maxVal) * RADIUS;
            const x = CENTER + r * Math.cos(angle);
            const y = CENTER + r * Math.sin(angle);
            return `${x},${y}`;
        }).join(" ");
    }, [data, maxVal]);

    // Calculate axes positions
    const axes = useMemo(() => {
        return data.map((item, i) => {
            const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
            const x = CENTER + RADIUS * Math.cos(angle);
            const y = CENTER + RADIUS * Math.sin(angle);
            const labelR = RADIUS + 25;
            const labelX = CENTER + labelR * Math.cos(angle);
            const labelY = CENTER + labelR * Math.sin(angle);
            return { x, y, labelX, labelY, label: item.label };
        });
    }, [data]);

    const gridLevels = [0.25, 0.5, 0.75, 1];

    if (data.length < 3) {
        return (
            <div className="flex items-center justify-center h-full text-xs text-slate-400">
                Need 3+ entities for radar
            </div>
        );
    }

    return (
        <svg
            width={CHART_SIZE}
            height={CHART_SIZE}
            className="block shrink-0"
        >
            {/* Grid Polygons */}
            {gridLevels.map((level, idx) => (
                <polygon
                    key={idx}
                    points={data.map((_, i) => {
                        const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
                        const r = RADIUS * level;
                        return `${CENTER + r * Math.cos(angle)},${CENTER + r * Math.sin(angle)}`;
                    }).join(" ")}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                />
            ))}

            {/* Axes Lines */}
            {axes.map((axis, i) => (
                <line
                    key={i}
                    x1={CENTER}
                    y1={CENTER}
                    x2={axis.x}
                    y2={axis.y}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                />
            ))}

            {/* Data Polygon */}
            <motion.polygon
                points={points}
                fill="rgba(1, 51, 76, 0.15)"
                stroke="#01334c"
                strokeWidth="2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
            />

            {/* Data Points */}
            {data.map((item, i) => {
                const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
                const r = (item.value / maxVal) * RADIUS;
                const x = CENTER + r * Math.cos(angle);
                const y = CENTER + r * Math.sin(angle);
                return (
                    <motion.circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#01334c"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                    />
                );
            })}

            {/* Labels */}
            {axes.map((axis, i) => (
                <text
                    key={i}
                    x={axis.labelX}
                    y={axis.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="9"
                    fill="#64748b"
                    fontWeight="500"
                >
                    {axis.label.length > 10 ? axis.label.substring(0, 8) + "..." : axis.label}
                </text>
            ))}
        </svg>
    );
}
