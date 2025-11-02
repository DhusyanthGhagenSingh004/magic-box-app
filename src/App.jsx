// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import HeroSlider from "./Components/HeroSlider";
import GreenTracker from "./Pages/GreenTracker";
import Flow from "./Pages/Flow";
import ErrorBoundary from "./Components/ErrorBoundary";
import InstallPrompt from "./Components/InstallPrompt";
import "./index.css";
import { ThemeProvider, useTheme } from "./theme/ThemeProvider";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <PageFrame />
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function PageFrame() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
            <Routes location={location}>
              <Route path="/" element={<Landing />} />
              <Route path="/tracker" element={<GreenTracker />} />
              <Route path="/flow" element={<Flow />} />
              <Route path="/about" element={<Placeholder title="About" />} />
              <Route path="/settings" element={<Placeholder title="Settings" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <InstallPrompt />
    </div>
  );
}

/* ---------- Header / Footer / Helpers ---------- */

function Header() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <RouterNavLink to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-slate-900">
            G
          </div>
          <div>
            <div className="text-lg font-semibold">GreenTracker</div>
            <div className="text-xs text-slate-400">Sustainability made simple</div>
          </div>
        </RouterNavLink>

        <nav className="flex items-center gap-4 text-sm">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/tracker">Tracker</NavLink>
          <NavLink to="/flow">Flow</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/settings">Settings</NavLink>
          <button onClick={toggleTheme} className="px-3 py-1 rounded-md hover:bg-slate-800 transition-colors text-xs border border-white/10">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ to, children }) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-1 rounded-md hover:bg-slate-800 transition-colors${isActive ? " bg-slate-800" : ""}`
      }
      end
    >
      {children}
    </RouterNavLink>
  );
}

function Landing() {
  return (
    <div>
      <HeroSlider />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-6 text-xs text-slate-400 flex justify-between">
        <div>© {new Date().getFullYear()} GreenTracker</div>
        <div>Built to make sustainable choices simple</div>
      </div>
    </footer>
  );
}

function Placeholder({ title }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="bg-slate-800 p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-slate-400 mt-2">Placeholder page — replace with content.</p>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="bg-slate-800 p-6 rounded-2xl shadow text-center">
        <h2 className="text-2xl font-semibold">404 — Not Found</h2>
        <p className="text-slate-400 mt-2">
          The page you're looking for doesn't exist.{" "}
          <Link to="/" className="underline">
            Go home
          </Link>.
        </p>
      </div>
    </div>
  );
}