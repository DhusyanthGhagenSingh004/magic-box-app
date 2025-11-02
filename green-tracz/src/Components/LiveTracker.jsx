// src/Components/LiveTracker.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { haversineDistance, detectModeFromSpeed, computeEmissions } from "../utils/footprint";
import { io } from "socket.io-client";

/**
 * LiveTracker
 * - uses browser geolocation
 * - connects to socket server for real-time updates
 * - on Stop -> saves via socket server to Firebase (if configured) and also stores locally
 * - shows toasts for success/failure
 */

const SOCKET_URL = (import.meta?.env?.VITE_SOCKET_URL) || "http://localhost:4000";

function formatTime(sec) {
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  const m = Math.floor((sec / 60) % 60).toString().padStart(2, "0");
  const h = Math.floor(sec / 3600).toString();
  return (h !== "0" ? `${h}:` : "") + `${m}:${s}`;
}

export default function LiveTracker({ initialMode = "car", onApplyLive }) {
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const [points, setPoints] = useState([]);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [startTs, setStartTs] = useState(null);
  const [pauseOffsetSec, setPauseOffsetSec] = useState(0);
  const [lastTick, setLastTick] = useState(null);
  const [toast, setToast] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [savingState, setSavingState] = useState(null); // null | "saving" | "ok" | "err"

  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { 
      transports: ["websocket"], 
      autoConnect: true,
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    socketRef.current.on("connect", () => {
      setSocketConnected(true);
      console.log("Connected to server");
    });
    
    socketRef.current.on("disconnect", () => {
      setSocketConnected(false);
      console.log("Disconnected from server");
    });
    
    socketRef.current.on("connect_error", (err) => {
      console.warn("Socket connect_error:", err.message);
      setSocketConnected(false);
    });
    
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const durationSec = startTs ? Math.max(0, Math.floor(((lastTick ?? Date.now()) - startTs) / 1000) - pauseOffsetSec) : 0;
  const avgSpeed = durationSec > 0 ? distanceMeters / durationSec : 0; // m/s

  const emissions = computeEmissions(distanceMeters, mode);
  const sessionKm = emissions.km;
  const kgCO2 = emissions.kg;
  const cost = emissions.cost;

  // START tracking
  function start() {
    if (!("geolocation" in navigator)) {
      setToast("Geolocation not supported in this browser");
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setPoints([]);
    setDistanceMeters(0);
    setStartTs(Date.now());
    setPauseOffsetSec(0);
    setLastTick(Date.now());
    setRunning(true);
    setPaused(false);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const ts = Date.now();

        setPoints((prev) => {
          const next = [...prev, { lat, lon, ts }];
          if (prev.length > 0) {
            const prevPt = prev[prev.length - 1];
            const d = haversineDistance(prevPt.lat, prevPt.lon, lat, lon);
            if (d >= 1) {
              setDistanceMeters((dm) => dm + d);
            }
          }
          return next;
        });

        setLastTick(ts);
      },
      (err) => {
        console.warn("geolocation error", err);
        setToast("Location unavailable or permission denied");
        setTimeout(() => setToast(null), 3000);
        stop(false); // stop but don't auto-apply
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );

    timerRef.current = setInterval(() => setLastTick(Date.now()), 1000);
  }

  function pause() {
    if (!running) return;
    setPaused(true);
    if (startTs) {
      const elapsed = Math.floor((Date.now() - startTs) / 1000) - pauseOffsetSec;
      setPauseOffsetSec((p) => p + Math.max(0, elapsed));
    }
    if (watchIdRef.current) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function resume() {
    if (!running) return;
    setPaused(false);
    // resume simply calls start's geolocation watcher logic but keeps totals
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const ts = Date.now();

        setPoints((prev) => {
          const next = [...prev, { lat, lon, ts }];
          if (prev.length > 0) {
            const prevPt = prev[prev.length - 1];
            const d = haversineDistance(prevPt.lat, prevPt.lon, lat, lon);
            if (d >= 1) {
              setDistanceMeters((dm) => dm + d);
            }
          }
          return next;
        });

        setLastTick(ts);
      },
      (err) => {
        setToast("Location error");
        setTimeout(() => setToast(null), 2000);
        stop(false);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );

    if (!timerRef.current) timerRef.current = setInterval(() => setLastTick(Date.now()), 1000);
  }

  /**
   * stop(finalApply = true)
   * - If finalApply true: writes to Firestore, persists locally, calls onApplyLive
   * - If false: just stops the tracking
   */
  async function stop(finalApply = true) {
    setRunning(false);
    setPaused(false);

    if (watchIdRef.current) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    const snapshot = {
      distanceMeters,
      durationSec,
      avgSpeed,
      mode,
      kgCO2: Number(kgCO2.toFixed(4)),
      cost: Number(cost.toFixed(2)),
      points,
      startedAt: startTs,
      stoppedAt: Date.now(),
    };

    // persist locally (history is used by tracker)
    try {
      const key = "gt_history_v1";
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift({
        date: new Date().toISOString(),
        inputs: {},
        report: {
          totalKgCO2: snapshot.kgCO2,
          totalCost: snapshot.cost,
          note: "live snapshot",
        },
        live: snapshot,
      });
      localStorage.setItem(key, JSON.stringify(arr.slice(0, 200)));
    } catch (e) {
      console.warn("local persist failed", e);
    }

    // Save via socket server to Firebase (if configured)
    if (finalApply) {
      setSavingState("saving");
      try {
        // Send snapshot to server via socket
        socketRef.current?.emit('live:stop', snapshot);
        
        // Listen for server response
        socketRef.current?.once('live:stop:ack', (response) => {
          if (response.ok) {
            setSavingState("ok");
            setToast("Snapshot saved to server");
            setTimeout(() => setToast(null), 2000);
          } else {
            setSavingState("err");
            setToast("Failed to save to server — saved locally");
            setTimeout(() => setToast(null), 2500);
          }
        });
        
        // Timeout after 5 seconds if no response
        setTimeout(() => {
          if (savingState === "saving") {
            setSavingState("err");
            setToast("Server timeout — saved locally");
            setTimeout(() => setToast(null), 2500);
          }
        }, 5000);
        
      } catch (err) {
        console.warn("Socket emit error", err);
        setSavingState("err");
        setToast("Failed to save to server — saved locally");
        setTimeout(() => setToast(null), 2500);
      }

      // call parent's callback so GreenTracker can apply snapshot immediately
      try {
        if (typeof onApplyLive === "function") {
          onApplyLive(snapshot);
        }
      } catch (e) {
        console.warn("onApplyLive error", e);
      }
    } else {
      setToast("Stopped");
      setTimeout(() => setToast(null), 1200);
    }

    // reset local live state so next run is fresh
    setPoints([]);
    setDistanceMeters(0);
    setStartTs(null);
    setPauseOffsetSec(0);
    setLastTick(null);
  }

  function applyLiveNow() {
    const snapshot = {
      distanceMeters,
      durationSec,
      avgSpeed,
      mode,
      kgCO2: Number(kgCO2.toFixed(4)),
      cost: Number(cost.toFixed(2)),
      points,
    };
    if (typeof onApplyLive === "function") {
      onApplyLive(snapshot);
      setToast("Live snapshot applied");
      setTimeout(() => setToast(null), 1500);
    }
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // small animated floating leaf SVG
  const Leaf = () => (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ y: [0, -8, 0], opacity: [0, 1, 1] }}
      transition={{ duration: 4, repeat: Infinity }}
      className="absolute right-4 top-3"
      aria-hidden
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
        <path d="M4 20c4-8 12-12 16-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 4c-2 4-8 8-12 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );

  return (
    <div className="relative">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Live Tracker</h3>
          <div className="text-xs text-slate-500">Captures movement using device GPS — grant permission when prompted.</div>
        </div>

        <div className="flex items-center gap-2 relative">
          {/* Socket connection status */}
          <div className={`px-2 py-1 rounded text-xs ${socketConnected ? "bg-emerald-400 text-slate-900" : "bg-red-400 text-white"}`}>
            {socketConnected ? "Connected" : "Offline"}
          </div>
          
          <div className="relative">
            {/* pulsing status ring */}
            <motion.div
              animate={{ scale: running ? 1.05 : 1, opacity: running ? 1 : 0.6 }}
              transition={{ type: "spring", stiffness: 160, damping: 12 }}
              className={`px-2 py-1 rounded text-xs ${running ? "bg-emerald-500 text-white" : "bg-amber-300 text-slate-900"}`}
            >
              {running ? "Recording" : "Idle"}
            </motion.div>
          </div>

          <select value={mode} onChange={(e) => setMode(e.target.value)} className="px-3 py-1 rounded border bg-white/90">
            <option value="car">Car</option>
            <option value="motorcycle">Motorcycle</option>
            <option value="public">Public</option>
            <option value="bike">Bike</option>
            <option value="walk">Walk</option>
          </select>

          {!running && (
            <motion.button
              onClick={start}
              whileTap={{ scale: 0.96 }}
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="px-4 py-2 rounded-full bg-emerald-500 text-white font-medium shadow-md"
              aria-label="Start tracking"
            >
              Start
            </motion.button>
          )}

          {running && !paused && (
            <button onClick={pause} className="px-3 py-1 rounded bg-yellow-500 text-white">Pause</button>
          )}

          {running && paused && (
            <button onClick={resume} className="px-3 py-1 rounded bg-emerald-400 text-white">Resume</button>
          )}

          {running && (
            <button onClick={() => stop(true)} className="px-3 py-1 rounded bg-rose-500 text-white">Stop & Save</button>
          )}

          {running && (
            <button onClick={applyLiveNow} className="px-3 py-1 rounded bg-sky-600 text-white">Apply live</button>
          )}
        </div>
      </div>

      {/* small animated stat cards */}
      <div className="mt-3 p-3 rounded-lg bg-white/6 border border-white/8 relative overflow-hidden">
        <Leaf />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <motion.div
            key={distanceMeters}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
            className="p-3 rounded bg-white/10"
          >
            <div className="text-xs text-slate-200">Distance</div>
            <div className="text-lg font-semibold">{sessionKm.toFixed(3)} km</div>
          </motion.div>

          <motion.div
            key={durationSec}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04, type: "spring", stiffness: 140, damping: 18 }}
            className="p-3 rounded bg-white/10"
          >
            <div className="text-xs text-slate-200">Duration</div>
            <div className="text-lg font-semibold">{formatTime(durationSec)}</div>
          </motion.div>

          <motion.div
            key={avgSpeed}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, type: "spring", stiffness: 140, damping: 18 }}
            className="p-3 rounded bg-white/10"
          >
            <div className="text-xs text-slate-200">Avg speed</div>
            <div className="text-lg font-semibold">{(avgSpeed * 3.6).toFixed(2)} km/h</div>
          </motion.div>

          <motion.div
            key={kgCO2}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, type: "spring", stiffness: 140, damping: 18 }}
            className="p-3 rounded bg-white/10"
          >
            <div className="text-xs text-slate-200">Est. CO₂</div>
            <div className="text-lg font-semibold">{kgCO2.toFixed(2)} kg</div>
            <div className="text-xs text-slate-400">Est. cost: ₹{cost.toFixed(2)}</div>
          </motion.div>
        </div>

        <div className="mt-3 text-xs text-slate-400">Points recorded: {points.length}</div>

        {points.length > 0 && (
          <div className="mt-3 p-2 bg-white/5 rounded text-xs text-slate-300">
            First: {points[0].lat.toFixed(4)},{points[0].lon.toFixed(4)} → Last: {points[points.length-1].lat.toFixed(4)},{points[points.length-1].lon.toFixed(4)}
          </div>
        )}
      </div>

      {/* saving state small indicator */}
      <div className="mt-2">
        {savingState === "saving" && <div className="text-xs text-slate-500">Saving to server...</div>}
        {savingState === "ok" && <div className="text-xs text-emerald-600">Saved to server ✅</div>}
        {savingState === "err" && <div className="text-xs text-rose-600">Server save failed</div>}
      </div>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }} transition={{ duration: 0.18 }} className="fixed right-6 bottom-6 bg-emerald-600 text-white px-4 py-2 rounded shadow-lg z-50 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M16.707 5.293a1 1 0 010 1.414L8.414 15 4.293 10.879a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" /></svg>
            <div className="font-medium">{toast}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
