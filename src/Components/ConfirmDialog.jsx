import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function ConfirmDialog({ open, title = "Confirm", description = "Are you sure?", confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-xl shadow-xl p-5 w-[90vw] max-w-sm text-slate-900"
            role="dialog"
            aria-modal
          >
            <div className="text-lg font-semibold">{title}</div>
            <div className="text-sm text-slate-600 mt-1">{description}</div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onCancel} className="px-3 py-1 rounded-md bg-slate-200 text-slate-800">{cancelText}</button>
              <button onClick={onConfirm} className="px-3 py-1 rounded-md bg-rose-600 text-white">{confirmText}</button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}


