import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function AnimatedButton({ children, className = "", to, variant = "primary", ...props }) {
  const base = `inline-flex items-center justify-center px-6 py-3 rounded-md font-medium transition ${className}`;
  const color = variant === 'secondary' ? 'bg-white text-slate-900 border border-white/30 hover:bg-white/95' : 'bg-emerald-600 text-white hover:bg-emerald-500';
  
  if (to) {
    return (
      <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98, y: 0 }}>
        <Link className={`${base} ${color}`} to={to} {...props}>
          {children}
        </Link>
      </motion.div>
    );
  }
  
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98, y: 0 }}
      className={`${base} ${color}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}


