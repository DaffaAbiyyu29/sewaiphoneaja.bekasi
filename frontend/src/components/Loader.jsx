import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Anti-mainstream Page Loader — Neon Blue Aurora Style ✨
 * -----------------------------------------------------
 * - Fullscreen loader dengan efek aurora biru dan morphing crystal
 * - Progress bar looping bolak-balik dari 0 → 100 → 0 terus
 */

export function Loader({
  loading = true,
  duration = 700,
  children,
}) {
  const [show, setShow] = useState(loading);

  useEffect(() => {
    if (loading) {
      setShow(true);
    } else {
      const t = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(t);
    }
  }, [loading, duration]);

  return (
    <div className="relative min-h-screen w-full">
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            key="loader-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: loading ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration / 1000 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden backdrop-blur-2xl bg-[#0a0f1c]/80"
          >
            {/* Aurora Layer */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute w-[120%] h-[120%] bg-gradient-to-r from-cyan-500/20 via-blue-500/30 to-indigo-700/20 blur-3xl rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
              />
              <motion.div
                className="absolute top-1/4 left-1/3 w-[80%] h-[80%] bg-gradient-to-br from-sky-300/20 via-blue-400/10 to-transparent blur-3xl rounded-full"
                animate={{ scale: [1, 1.3, 1], rotate: [0, 45, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 10,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Floating Crystal Animation */}
            <motion.div
              className="relative z-10 flex flex-col items-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.div
                className="relative w-32 h-32"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              >
                <motion.div
                  className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 via-cyan-400 to-indigo-600 shadow-[0_0_60px_rgba(0,150,255,0.6)]"
                  animate={{
                    borderRadius: ["40%", "60%", "30%", "50%", "40%"],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>

              <motion.h2
                className="mt-10 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 text-2xl font-bold tracking-wider drop-shadow-[0_0_10px_rgba(0,200,255,0.3)]"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                Memuat Data...
              </motion.h2>

              {/* Progress bar looping 0 → 100 → 0 */}
              <div className="relative mt-4 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="absolute h-full w-full bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 rounded-full"
                  initial={{ x: "-100%" }}
                  animate={{ x: ["-100%", "0%", "-100%"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
