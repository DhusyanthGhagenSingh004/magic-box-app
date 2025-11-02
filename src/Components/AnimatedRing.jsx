// src/Components/AnimatedRing.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

/**
 * AnimatedRing
 * Props:
 *  - size (px)
 *  - stroke (px)
 *  - value (0..100 or absolute depending on 'max')
 *  - max  (default 100)
 *  - color (string)
 *  - label (string)
 *  - suffix (string) e.g. 'kg' or '₹'
 */
export default function AnimatedRing({
  size = 120,
  stroke = 10,
  value = 60,
  max = 100,
  color = "#16a34a",
  label = "",
  suffix = "",
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const [display, setDisplay] = useState(0);
  const controls = useAnimation();
  const rafRef = useRef(null);

  // animate stroke-dashoffset using framer-motion on mount when value changes
  useEffect(() => {
    const pct = Math.max(0, Math.min(1, value / Math.max(1, max)));
    const dashoffset = circumference * (1 - pct);
    controls.start({ strokeDashoffset: dashoffset, transition: { duration: 1.1, ease: "easeOut" } });

    // simple number tween (requestAnimationFrame)
    const start = performance.now();
    const startVal = display;
    const endVal = Math.round((value / max) * 100 * 100) / 100; // percent with 2 decimals
    const duration = 1100;
    cancelAnimationFrame(rafRef.current);
    function step(ts) {
      const t = Math.min(1, (ts - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad like
      const cur = startVal + (endVal - startVal) * eased;
      setDisplay(Number(cur.toFixed(2)));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, max, circumference, controls]);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        <defs>
          <linearGradient id={`grad-${color.replace("#","")}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.98" />
            <stop offset="100%" stopColor={color} stopOpacity="0.65" />
          </linearGradient>
        </defs>

        {/* background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ffffff22"
          strokeWidth={stroke}
          fill="transparent"
        />

        {/* animated foreground */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#grad-${color.replace("#","")})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={controls}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
      </svg>

      <div className="mt-2 text-center">
        <div className="text-xl font-semibold text-white">
          {/* display as percent of max by default (0-100). If you want raw value, pass max large */}
          {display}
          {suffix && <span className="text-sm ml-1">{suffix}</span>}
        </div>
        {label && <div className="text-xs text-white/80">{label}</div>}
      </div>
    </div>
  );
}
