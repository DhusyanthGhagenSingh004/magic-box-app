import React from "react";
import { motion } from "framer-motion";

export default function AnimatedStat({ title, value, subtitle, currency }) {
  return (
    <motion.div layout className="p-4 rounded-lg bg-gradient-to-b from-slate-800 to-slate-700">
      <div className="text-xs text-slate-400">{title}</div>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold mt-1">
        {currency ? `₹${value}` : value}
      </motion.div>
      <div className="text-xs text-slate-400 mt-1">{subtitle}</div>
    </motion.div>
  );
}
