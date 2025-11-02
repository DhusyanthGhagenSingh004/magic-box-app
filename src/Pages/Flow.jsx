// src/Pages/Flow.jsx
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { calculateWeekly } from "../utils/calculations"; // keep your calculation util
import LiveTracker from "../Components/LiveTracker";        // <-- IMPORT

export default function Flow() {
  // sample local inputs for the demo
  const [inputs, setInputs] = useState({
    transportKm: 40,
    transportMode: "car",
    meatMealsPerWeek: 3,
    singleUsePlasticsPerWeek: 4,
    electricityKwhPerMonth: 180,
    reusableBottle: false,
    reusableBag: false,
    solarAtHome: false,
  });

  const report = useMemo(() => calculateWeekly(inputs), [inputs]);

  return (
    <div className="min-h-[70vh] py-12 bg-gradient-to-br from-emerald-700 to-indigo-700 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h1 initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl font-extrabold mb-2">
          Calculation Flow — Demo
        </motion.h1>
        <p className="mb-8 text-slate-100/80">Preset: flow-demo — interactive calculation preview.</p>

        {/* LIVE TRACKER inserted here */}
        <LiveTracker initialMode={inputs.transportMode} />

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-6 bg-white/6 rounded-2xl border border-white/10">
            <h3 className="font-semibold mb-3">Inputs</h3>
            <label className="text-sm">Daily transport (km)</label>
            <input type="range" min="0" max="200" value={inputs.transportKm}
              onChange={(e) => setInputs((s) => ({ ...s, transportKm: Number(e.target.value) }))}
              className="w-full mb-2" />
            <div className="text-xs mb-4">{inputs.transportKm} km/day</div>

            <label className="text-sm">Electricity (kWh / month)</label>
            <input className="w-full p-2 rounded mt-1" value={inputs.electricityKwhPerMonth} onChange={(e) => setInputs((s) => ({ ...s, electricityKwhPerMonth: Number(e.target.value) }))} />

            <div className="mt-4 text-sm">Reusable bottle</div>
            <label className="inline-flex items-center gap-2 mt-2">
              <input type="checkbox" checked={inputs.reusableBottle} onChange={(e) => setInputs((s) => ({ ...s, reusableBottle: e.target.checked }))} />
              <span className="text-sm">I use a reusable bottle</span>
            </label>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="md:col-span-2 p-6 bg-white/6 rounded-2xl border border-white/10">
            <h3 className="font-semibold mb-3">Results (weekly)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="CO₂ (kg)" value={report?.totalKgCO2?.toFixed(2) ?? "—"} />
              <StatCard title="Money (₹)" value={report?.totalCost?.toFixed(2) ?? "—"} />
              <StatCard title="Electricity (kWh)" value={report?.weeklyElectricityKwh?.toFixed(2) ?? "—"} />
            </div>

            <div className="mt-6">
              <h4 className="font-medium">Suggestions (quick)</h4>
              <div className="flex gap-3 mt-3 flex-wrap">
                <button className="px-3 py-2 rounded bg-emerald-400 text-slate-900">Try public transport 2 days/week</button>
                <button className="px-3 py-2 rounded bg-emerald-400 text-slate-900">Carpool once a week</button>
                <button className="px-3 py-2 rounded bg-emerald-400 text-slate-900">Use a reusable bottle</button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="p-4 rounded-lg bg-gradient-to-br from-slate-800/40 to-slate-900/30 border border-white/10">
      <div className="text-xs text-slate-200">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
    </div>
  );
}
