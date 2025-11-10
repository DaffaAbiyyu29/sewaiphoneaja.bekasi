import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// PageNotFound_Antimainstream.jsx
// Requirements: Tailwind CSS + framer-motion installed
// Usage: import PageNotFound from './PageNotFound_Antimainstream';
// place it as route component or show when 404

export default function PageNotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    // inject small stylesheet for some fine-tuned animations
    const id = "pnf-antimainstream-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      @keyframes float1 { 0% { transform: translateY(0) rotate(0deg);} 50% { transform: translateY(-18px) rotate(6deg);} 100% { transform: translateY(0) rotate(0deg);} }
      @keyframes float2 { 0% { transform: translateY(0) rotate(0deg);} 50% { transform: translateY(-28px) rotate(-6deg);} 100% { transform: translateY(0) rotate(0deg);} }
      @keyframes scanline { 0% { background-position: 0 -100%; } 100% { background-position: 0 100%; } }
      .glitch-layer { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); pointer-events: none; }
      .scanlines { background-image: linear-gradient(transparent 75%, rgba(255,255,255,0.03) 76%); background-size: 100% 6px; animation: scanline 6s linear infinite; mix-blend-mode: overlay; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-tr from-neutral-900 via-slate-900 to-stone-800 text-white">
      {/* animated blob / bokeh background */}
      <motion.div
        className="absolute -left-28 -top-28 w-[42rem] h-[42rem] rounded-full filter blur-3xl opacity-60 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,99,71,0.16), transparent 20%), radial-gradient(circle at 80% 80%, rgba(99,102,241,0.12), transparent 30%)",
        }}
        animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.04, 0.98, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute right-[-6rem] top-[10rem] w-96 h-96 rounded-full filter blur-2xl opacity-50"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(34,197,94,0.12), transparent 30%)",
        }}
        animate={{ y: [0, -24, 0], x: [0, 18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute left-10 bottom-[-6rem] w-72 h-72 rounded-full filter blur-2xl opacity-40"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, rgba(245,158,11,0.10), transparent 30%)",
        }}
        animate={{ y: [0, -34, 0], x: [0, -14, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* subtle noise + scanlines */}
      <div className="absolute inset-0 pointer-events-none scanlines" />

      {/* main glass card */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-3xl backdrop-blur-sm bg-white/6 border border-white/10 rounded-3xl p-10 md:p-16 shadow-2xl shadow-black/60">
          {/* glitchy 404 */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="relative w-full h-40 flex items-center justify-center">
              {/* layered colored copies for glitch effect */}
              <div
                className="glitch-layer"
                style={{ width: "100%", height: "100%" }}
              >
                <div
                  aria-hidden
                  className="absolute text-[92px] md:text-[140px] font-extrabold tracking-tight"
                  style={{ transform: "translate(27%, -20%)" }}
                >
                  <span
                    style={{
                      position: "relative",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        transform: "translate(4px, -3px)",
                        color: "rgba(99,102,241,0.85)",
                        filter: "blur(0.6px)",
                        mixBlendMode: "screen",
                      }}
                    >
                      404
                    </span>
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        transform: "translate(-4px, 3px)",
                        color: "rgba(250,204,21,0.9)",
                        filter: "blur(0.4px)",
                        mixBlendMode: "screen",
                      }}
                    >
                      404
                    </span>
                    <span style={{ position: "relative", color: "white" }}>
                      404
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* message & actions */}
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-semibold mb-3">
              Halaman Tidak Ditemukan
            </h3>
            <p className="text-sm md:text-base text-white/70 max-w-xl mx-auto mb-6">
              Maaf, halaman yang Anda cari tidak tersedia atau telah
              dipindahkan. Silakan kembali ke beranda atau hubungi tim{" "}
              <span className="text-sky-400">sewaiphone.bekasi</span> untuk
              bantuan lebih lanjut.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="group relative inline-flex items-center gap-3 rounded-full px-5 py-2.5 bg-gradient-to-r from-sky-500/95 to-indigo-600/95 text-white font-medium shadow-lg ring-1 ring-white/10 hover:scale-105 active:scale-95 transition-transform"
              >
                <span className="inline-block w-3 h-3 rounded-full bg-white/90 group-hover:animate-pulse" />
                Kembali ke Home
              </button>

              <button
                onClick={() => window.history.back()}
                className="group relative inline-flex items-center gap-3 rounded-full px-5 py-2.5 text-sm border border-white/10 text-white/80 hover:bg-white/3 transition-transform"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* footer little credit */}
      <div className="absolute bottom-6 left-6 text-xs text-white/40 z-30">
        — pagenotfound 404 • sewaiphoneaja.bekasi
      </div>
    </div>
  );
}
