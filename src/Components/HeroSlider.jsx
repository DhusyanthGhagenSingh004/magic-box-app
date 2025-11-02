// src/Components/HeroSlider.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedButton from "./AnimatedButton";

// Replace with your actual images in src/assets/
import hero1 from "../assets/Greens.jpg";
import hero2 from "../assets/Finance.jpg";
import hero3 from "../assets/Greens.jpg";

/**
 * HeroSlider — photo slides with frosted-glass featured card and readable headline.
 * - Slight image dim + left->right overlay for legibility
 * - Featured card uses backdrop blur (frosted glass)
 * - Auto-advance + manual arrows + dots
 */

const slides = [
  {
    id: 1,
    bg: hero1,
    title: "Green Lifestyle & Finance Tracker",
    subtitle: "Sustainability Made Simple",
    desc: "See both your environmental impact and financial savings — motivating, practical, simple.",
    cta1: { label: "Try Suggestions", to: "/tracker" },
    cta2: { label: "See Flow", to: "/flow" },
    featured: {
      heading: "Calculates your carbon & savings",
      text: "Daily/weekly CO₂ + money spent. Fun visuals (e.g., “You saved 2 trees 🌳 and ₹500 💰 this week”).",
      btn1: "See Flow",
      btn2: "Sample Data",
    },
  },
  {
    id: 2,
    bg: hero2,
    title: "Practical swaps, measurable results",
    subtitle: "Eco Choices That Save",
    desc: "Small swaps such as using public transport or reusable bottles add up — and save you money.",
    cta1: { label: "Start Tracking", to: "/tracker" },
    cta2: { label: "Learn More", to: "/about" },
    featured: {
      heading: "Suggestions & Goals",
      text: "Swap ideas (e.g., 1 veg meal/week) and track progress with badges & rewards.",
      btn1: "See Flow",
      btn2: "Sample Data",
    },
  },
  {
    id: 3,
    bg: hero3,
    title: "Celebrate your eco wins",
    subtitle: "Rewards That Motivate",
    desc: "Track progress, earn badges, and set savings goals — make sustainability a rewarding journey.",
    cta1: { label: "View Dashboard", to: "/tracker" },
    cta2: { label: "About Us", to: "/about" },
    featured: {
      heading: "Progress Tracking",
      text: "Badges, milestones, and weekly reports keep you motivated and consistent.",
      btn1: "See Flow",
      btn2: "Sample Data",
    },
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  // auto advance slide every 5s
  useEffect(() => {
    const t = setInterval(() => setIndex((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = slides[index];

  // Slight heavy shadow for headline (keeps readable on bright images)
  const titleShadowStyle = { textShadow: "0 6px 18px rgba(0,0,0,0.7)" };

  return (
    <div className="relative w-full h-[80vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.75 }}
          className="absolute inset-0 flex items-center"
        >
          {/* Background image: slightly dimmed for consistency */}
          <div
            className="absolute inset-0 bg-cover bg-center brightness-90"
            style={{ backgroundImage: `url(${slide.bg})` }}
            aria-hidden
          />

          {/* Left-to-right overlay to ensure left-aligned headline stays legible */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 grid md:grid-cols-2 gap-12 items-center">
            {/* Left: heading, description, CTAs */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-xl"
            >
              <p className="text-emerald-400 font-semibold text-sm mb-3">{slide.subtitle}</p>

              <h1
                className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight"
                style={titleShadowStyle}
              >
                {slide.title}
              </h1>

              <p className="text-white/90 text-lg mb-6">{slide.desc}</p>

              <div className="flex gap-4">
                <AnimatedButton to={slide.cta1.to}>{slide.cta1.label}</AnimatedButton>
                <AnimatedButton to={slide.cta2.to} variant="secondary">{slide.cta2.label}</AnimatedButton>
              </div>
            </motion.div>

            {/* Right: frosted-glass featured card */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 10, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-end"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl shadow-2xl p-6 max-w-md border"
                style={{
                  backgroundColor: "rgba(255,255,255,0.35)", // translucent base to allow blur view-through
                  borderColor: "rgba(255,255,255,0.25)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }}
              >
                <p className="text-emerald-600 text-sm font-medium mb-2">Featured</p>
                <h3 className="text-xl font-semibold text-white/95 mb-2">{slide.featured.heading}</h3>
                <p className="text-white/90 mb-4 text-sm">{slide.featured.text}</p>

                <div className="flex gap-3">
                  <Link
                    to="/flow"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-500 transition"
                  >
                    {slide.featured.btn1}
                  </Link>
                  <button className="px-4 py-2 bg-white/70 text-slate-900 rounded-md text-sm hover:bg-white transition">
                    {slide.featured.btn2}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Left & Right arrows */}
          <button
            onClick={() => setIndex((index - 1 + slides.length) % slides.length)}
            aria-label="Previous slide"
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/30 transition"
          >
            ‹
          </button>

          <button
            onClick={() => setIndex((index + 1) % slides.length)}
            aria-label="Next slide"
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/30 transition"
          >
            ›
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition ${i === index ? "bg-emerald-500 scale-110" : "bg-white/60"}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}