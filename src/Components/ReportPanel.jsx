// src/Components/ReportPanel.jsx
import React from "react";
import { motion } from "framer-motion";

function isValidNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}

export default function ReportPanel({ report = {}, badges = [], liveNote = null }) {
  const totalKgCO2 = isValidNumber(report.totalKgCO2) ? report.totalKgCO2 : 0;
  const totalCost = isValidNumber(report.totalCost) ? report.totalCost : 0;
  const weeklyElec = isValidNumber(report.weeklyElectricityKwh) ? report.weeklyElectricityKwh : 0;
  const progressPercent = isValidNumber(report.progressPercent) ? Math.min(100, Math.max(0, report.progressPercent)) : 0;

  const formatMoney = (v) => (isValidNumber(v) ? `₹${v.toFixed(2)}` : "—");
  const formatKg = (v) => (isValidNumber(v) ? `${v.toFixed(2)} kg` : "—");
  const formatKwh = (v) => (isValidNumber(v) ? `${v.toFixed(1)} kWh` : "—");

  const formatTime = (sec) => {
    if (!isValidNumber(sec) || sec <= 0) return "0:00";
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    const m = Math.floor((sec / 60) % 60).toString().padStart(2, "0");
    const h = Math.floor(sec / 3600).toString();
    return (h !== "0" ? `${h}:` : "") + `${m}:${s}`;
  };

  const treesSaved = Math.max(0, Math.round(totalKgCO2 / 21));
  const moneySaved = totalCost;

  const live = liveNote
    ? {
        km: isValidNumber(liveNote.distanceMeters) ? (liveNote.distanceMeters / 1000).toFixed(2) : "0.00",
        kg: isValidNumber(liveNote.kgCO2) ? liveNote.kgCO2.toFixed(3) : "0.000",
        time: isValidNumber(liveNote.durationSec) ? liveNote.durationSec : 0,
        mode: liveNote.mode ?? "—",
      }
    : null;

  return (
    <div className="w-full">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold">This week — impact & savings</h3>
          <p className="text-sm text-slate-500">Quick snapshot of your weekly footprint and progress.</p>
        </div>

        {live && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 140 }} className="ml-4 text-right">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-lg shadow-sm relative overflow-hidden">
              {/* shimmer bar */}
              <motion.div
                className="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                aria-hidden
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M16.707 5.293a1 1 0 010 1.414L8.414 15 4.293 10.879a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" />
              </svg>
              <div className="text-left relative z-10">
                <div className="text-sm font-medium">Applied from live</div>
                <div className="text-xs text-emerald-700/80">
                  {live.km} km · {live.kg} kg CO₂ · {formatTime(live.time)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="CO₂ (kg)" value={formatKg(totalKgCO2)} sub="weekly total" />
        <StatCard title="Money (₹)" value={formatMoney(totalCost)} sub="weekly estimate" />
        <StatCard title="Electricity (kWh)" value={formatKwh(weeklyElec)} sub="weekly" />
      </div>

      <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-sm text-slate-600">
          <strong className="text-slate-800">{treesSaved}</strong> trees equivalent saved ·{" "}
          <strong className="text-slate-800">{formatMoney(moneySaved)}</strong> spent this week
        </div>

        <div className="flex gap-2 flex-wrap">
          {badges && badges.length > 0 ? (
            badges.map((b) => {
              const key = (b && (b.id || b.label)) || String(b);
              const label = (b && (b.label || b.id)) || String(b);
              return (
                <div key={key} className="px-3 py-1 bg-emerald-600 text-white rounded-full text-sm shadow-sm">
                  {label}
                </div>
              );
            })
          ) : (
            <div className="text-xs text-slate-400">No badges yet — try some swaps!</div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs text-slate-500 mb-2">Emission goal progress</div>
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-3 rounded-full bg-emerald-600 transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="p-4 rounded-lg bg-gradient-to-br from-white/90 to-slate-100 border border-slate-200">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-2xl font-semibold mt-2 text-slate-900">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </motion.div>
  );
}
