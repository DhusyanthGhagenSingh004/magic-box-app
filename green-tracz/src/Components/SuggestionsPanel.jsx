import React from "react";
import { motion, AnimatePresence } from "framer-motion";

function ImpactBar({ value = 0 }) {
  return (
    <div className="h-2 w-24 bg-slate-600 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.35 }} className="h-full bg-emerald-500" />
    </div>
  );
}

export default function SuggestionsPanel({ suggestions, applySuggestion }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <AnimatePresence>
        {suggestions.map((s) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="p-3 rounded-lg bg-slate-700/80 border border-white/10 flex justify-between items-center gap-3"
          >
            <div className="flex-1">
              <div className="font-semibold">{s.title}</div>
              <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <ImpactBar value={Math.min(100, Math.max(0, Math.round((s.impact.kgCO2 || 0) * 5)))} />
                <span>~ {Math.round(s.impact.kgCO2)} kg CO₂</span>
                <span className="opacity-60">•</span>
                <span>save ~ ₹{s.impact.money}</span>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.03 }} className="text-xs bg-emerald-600 px-3 py-1.5 rounded-md text-white shadow" onClick={() => applySuggestion(s)}>
              Apply
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
