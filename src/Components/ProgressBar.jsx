import React from "react";
import { motion } from "framer-motion";

export default function ProgressBar({ value = 40, label }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="w-full h-3 bg-slate-700 rounded-full mt-2 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} className="h-full bg-emerald-500 rounded-full" />
      </div>
      <div className="text-xs text-slate-300 mt-1">{Math.round(value)}%</div>
    </div>
  );
}
