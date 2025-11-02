// src/Pages/GreenTracker.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import InputPanel from "../Components/InputPanel";
import ReportPanel from "../Components/ReportPanel";
import SuggestionsPanel from "../Components/SuggestionsPanel";
import HistoryPanel from "../Components/HistoryPanel";
import LiveTracker from "../Components/LiveTracker";
import { calculateWeekly, generateSuggestions, computeBadges } from "../utils/calculations";
import { motion, AnimatePresence } from "framer-motion";

const LS_INPUTS = "gt_inputs_v1";
const LS_HISTORY = "gt_history_v1";

export default function GreenTracker() {
  const dashboardRef = useRef(null);
  const [toast, setToast] = useState(null);
  const [lastLiveSnapshot, setLastLiveSnapshot] = useState(null);
  const [error, setError] = useState(null);

  // Add error handling
  useEffect(() => {
    const handleError = (e) => {
      console.error('GreenTracker error:', e);
      setError(e.message);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error in Tracker</h1>
          <p className="text-slate-300 mb-4">{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const loadInputs = () => {
    try {
      const raw = localStorage.getItem(LS_INPUTS);
      return raw
        ? JSON.parse(raw)
        : {
            transportKm: 12,
            transportMode: "car",
            meatMealsPerWeek: 3,
            singleUsePlasticsPerWeek: 4,
            electricityKwhPerMonth: 200,
            reusableBottle: false,
            reusableBag: false,
            solarAtHome: false,
          };
    } catch {
      return {
        transportKm: 12,
        transportMode: "car",
        meatMealsPerWeek: 3,
        singleUsePlasticsPerWeek: 4,
        electricityKwhPerMonth: 200,
        reusableBottle: false,
        reusableBag: false,
        solarAtHome: false,
      };
    }
  };

  const loadHistory = () => {
    try {
      const raw = localStorage.getItem(LS_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const [inputs, setInputs] = useState(loadInputs);
  const [history, setHistory] = useState(loadHistory);

  useEffect(() => localStorage.setItem(LS_INPUTS, JSON.stringify(inputs)), [inputs]);
  useEffect(() => localStorage.setItem(LS_HISTORY, JSON.stringify(history)), [history]);

  const weeklyReport = useMemo(() => calculateWeekly(inputs), [inputs]);
  const suggestions = useMemo(() => generateSuggestions(weeklyReport, inputs), [weeklyReport, inputs]);
  const badges = useMemo(() => computeBadges(weeklyReport, inputs), [weeklyReport, inputs]);

  function saveSnapshot() {
    const snapshot = { date: new Date().toISOString(), inputs: { ...inputs }, report: { ...weeklyReport } };
    setHistory((h) => [snapshot, ...h].slice(0, 52));
    setToast("Snapshot saved!");
    setTimeout(() => setToast(null), 2500);
  }

  function applySuggestion(suggestion) {
    if (suggestion.id === "switch_public") setInputs((s) => ({ ...s, transportMode: "public" }));
    if (suggestion.id === "carpool") setInputs((s) => ({ ...s, transportKm: Math.max(0, s.transportKm - 5) }));
    if (suggestion.id === "bottle") setInputs((s) => ({ ...s, reusableBottle: true, singleUsePlasticsPerWeek: Math.max(0, s.singleUsePlasticsPerWeek - 3) }));
    if (suggestion.id === "veg_swap") setInputs((s) => ({ ...s, meatMealsPerWeek: Math.max(0, s.meatMealsPerWeek - 1) }));
    if (suggestion.id === "solar") setInputs((s) => ({ ...s, solarAtHome: true }));
  }

  function exportHistoryCSV() {
    if (!history || history.length === 0) return;
    const headers = [
      "date",
      "transportKm",
      "transportMode",
      "meatMealsPerWeek",
      "singleUsePlasticsPerWeek",
      "electricityKwhPerMonth",
      "reusableBottle",
      "reusableBag",
      "solarAtHome",
      "totalKgCO2",
      "totalCost",
      "weeklyElectricityKwh",
      "reportJSON",
    ];
    const rows = history.map((h) => {
      const i = h.inputs || {};
      const r = h.report || {};
      const reportJSON = JSON.stringify(r).replace(/"/g, '""');
      return [
        h.date,
        i.transportKm ?? "",
        i.transportMode ?? "",
        i.meatMealsPerWeek ?? "",
        i.singleUsePlasticsPerWeek ?? "",
        i.electricityKwhPerMonth ?? "",
        i.reusableBottle ?? "",
        i.reusableBag ?? "",
        i.solarAtHome ?? "",
        r.totalKgCO2 ?? "",
        r.totalCost ?? "",
        r.weeklyElectricityKwh ?? "",
        `"${reportJSON}"`,
      ];
    });
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `green-tracker-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearAllData() {
    if (!confirm("Clear saved inputs and history?")) return;
    localStorage.removeItem(LS_INPUTS);
    localStorage.removeItem(LS_HISTORY);
    setInputs(loadInputs());
    setHistory([]);
    setLastLiveSnapshot(null);
    setToast("All data cleared!");
    setTimeout(() => setToast(null), 2500);
  }

  function handleClearHistory() {
    if (confirm("Clear saved history?")) setHistory([]);
  }

  function applyLiveToTracker(snapshot) {
    if (!snapshot) return;
    const savedSnapshot = {
      date: new Date().toISOString(),
      inputs: { ...inputs },
      report: {
        totalKgCO2: snapshot.kgCO2 ?? 0,
        totalCost: snapshot.cost ?? 0,
        weeklyElectricityKwh: inputs.electricityKwhPerMonth ? inputs.electricityKwhPerMonth / 4 : 0,
        note: "applied from live snapshot",
      },
      live: {
        distanceMeters: snapshot.distanceMeters ?? 0,
        durationSec: snapshot.durationSec ?? 0,
        avgSpeed: snapshot.avgSpeed ?? 0,
        mode: snapshot.mode ?? inputs.transportMode,
        kgCO2: snapshot.kgCO2 ?? 0,
        cost: snapshot.cost ?? 0,
      },
    };
    setHistory((h) => [savedSnapshot, ...h].slice(0, 200));
    const sessionKm = snapshot.distanceMeters ? snapshot.distanceMeters / 1000 : 0;
    setInputs((prev) => {
      const inferredTransportKm = Math.max(prev.transportKm, Math.round(sessionKm));
      const inferredMode = snapshot.mode || prev.transportMode;
      return {
        ...prev,
        transportKm: inferredTransportKm,
        transportMode: inferredMode,
      };
    });
    setLastLiveSnapshot({
      distanceMeters: snapshot.distanceMeters ?? 0,
      durationSec: snapshot.durationSec ?? 0,
      avgSpeed: snapshot.avgSpeed ?? 0,
      kgCO2: snapshot.kgCO2 ?? 0,
      cost: snapshot.cost ?? 0,
      mode: snapshot.mode ?? inputs.transportMode,
      ts: Date.now(),
    });
    setToast("Live data applied to tracker");
    setTimeout(() => setToast(null), 3000);
    setTimeout(() => {
      if (dashboardRef.current) {
        dashboardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 350);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.55 }}
      ref={dashboardRef}
      className="min-h-screen animated-gradient-bg text-slate-900 py-10"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* header */}
        <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Green Lifestyle & Finance Tracker</h1>
            <p className="text-sm text-slate-700">Sustainability made simple — impact + savings together.</p>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={saveSnapshot} className="text-sm bg-emerald-600 px-3 py-1 rounded-md text-white">Save Week</button>
            <button onClick={exportHistoryCSV} className="text-sm bg-sky-700 px-3 py-1 rounded-md text-white">Export CSV</button>
            <button onClick={clearAllData} className="text-sm bg-rose-600 px-3 py-1 rounded-md text-white">Clear Data</button>
          </div>
        </motion.header>

        {/* main layout: LiveTracker + inputs + report */}
        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* left column: Live tracker at the top, then Input panel */}
          <motion.aside initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="md:col-span-1 space-y-4">
            <div className="bg-white/6 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow">
              <LiveTracker onApplyLive={applyLiveToTracker} initialMode={inputs.transportMode || "car"} />
            </div>
            <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow">
              <InputPanel inputs={inputs} setInputs={setInputs} />
            </div>
          </motion.aside>

          {/* right columns: report, suggestions, history */}
          <section className="md:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-white/80 backdrop-blur-md border border-slate-200 p-6 rounded-2xl shadow-lg">
              <ReportPanel report={weeklyReport} badges={badges} liveNote={lastLiveSnapshot} />
              <div className="mt-6">
                <h4 className="font-medium mb-3">Suggestions</h4>
                <SuggestionsPanel suggestions={suggestions} applySuggestion={applySuggestion} />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="bg-white/80 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow">
              <HistoryPanel
                history={history}
                exportCSV={exportHistoryCSV}
                clearHistory={handleClearHistory}
              />
            </motion.div>
          </section>
        </main>
      </div>

      {/* toast feedback */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.25 }} className="fixed right-6 bottom-6 bg-emerald-600 text-white px-4 py-2 rounded shadow-lg z-50">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// No changes needed for navigation if the export is correct.