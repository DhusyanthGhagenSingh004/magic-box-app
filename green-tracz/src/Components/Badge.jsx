import React from "react";
import { motion } from "framer-motion";

export default function Badge({ label }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="px-2 py-1 bg-emerald-600 text-white rounded-full text-xs">
      {label}
    </motion.div>
  );
}
