import React from "react";

/**
 * props:
 *  - history: array of snapshots
 *  - exportCSV?: optional function to trigger CSV export (passed from parent)
 *  - clearHistory?: optional function to clear history (passed from parent)
 */
export default function HistoryPanel({ history, exportCSV, clearHistory }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">History</h4>
        <div className="flex gap-2">
          {history && history.length > 0 && exportCSV ? (
            <button onClick={exportCSV} className="text-xs bg-emerald-600 px-2 py-1 rounded text-white">Export CSV</button>
          ) : null}
          {history && history.length > 0 && clearHistory ? (
            <button onClick={clearHistory} className="text-xs bg-red-600 px-2 py-1 rounded text-white">Clear History</button>
          ) : null}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {history.length === 0 ? (
          <div className="text-xs text-slate-400">No saved weeks — click Save Week</div>
        ) : (
          history.map((h) => (
            <div key={h.date} className="p-3 bg-slate-700 rounded-lg text-xs min-w-[220px]">
              <div className="font-semibold">{new Date(h.date).toLocaleString()}</div>
              <div className="text-slate-300 mt-1">CO₂: {h.report?.totalKgCO2 ?? "—"} kg</div>
              <div className="text-slate-300">Cost: ₹{h.report?.totalCost ?? "—"}</div>
              <div className="text-slate-300 mt-2 text-[11px]">
                Transport: {h.inputs?.transportMode} • {h.inputs?.transportKm} km/day
              </div>
              <div className="text-slate-300 text-[11px]">Meat/wk: {h.inputs?.meatMealsPerWeek}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}