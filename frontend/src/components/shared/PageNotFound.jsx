import {
  faArrowLeft,
  faHome,
  faLock,
  faServer,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef } from "react";

export default function ErrorPage({ message, statusCode = 404 }) {
  const canvasRef = useRef(null);

  const errorConfig = {
    404: {
      title: "PAGE NOT FOUND",
      defaultMessage:
        "Data tidak ditemukan dalam sistem. Koordinat halaman ini telah dihapus dari server.",
      icon: faTriangleExclamation,
      primary: "#0099ff",
      secondary: "#001540",
      glitch1: "#0099ff",
      glitch2: "#0072ff",
      glow: "rgba(0, 210, 255, 0.4)",
    },
    403: {
      title: "ACCESS DENIED",
      defaultMessage:
        "Sistem keamanan mendeteksi upaya akses ilegal ke area terlarang. Izin ditolak.",
      icon: faLock,
      primary: "#ff3131e0",
      secondary: "#450a0a",
      glitch1: "#ff3131e0",
      glitch2: "#991b1b",
      glow: "rgba(255, 49, 49, 0.4)",
    },
    500: {
      title: "SERVER ERROR",
      defaultMessage:
        "Kesalahan fatal terdeteksi. Core system mengalami gangguan. Proses recovery dimulai.",
      icon: faServer,
      primary: "#ffaa00",
      secondary: "#451a03",
      glitch1: "#d4ff00",
      glitch2: "#b45309",
      glow: "rgba(255, 170, 0, 0.4)",
    },
  };

  const config = errorConfig[statusCode] || errorConfig[404];

  // Gunakan message dari props jika ada, jika tidak pakai defaultMessage dari config
  const displayMessage = message || config.defaultMessage;

  // Matrix Rain Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?/ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃ".split(
        "",
      );
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    function draw() {
      ctx.fillStyle = "rgba(7, 7, 8, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `bold ${fontSize}px 'Courier New', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        const opacity = drops[i] > 0 ? Math.min(1, 20 / drops[i]) : 0;

        ctx.fillStyle = config.primary;
        ctx.globalAlpha = opacity * 0.8;
        ctx.fillText(char, x, y);
        ctx.shadowBlur = 5;
        ctx.shadowColor = config.primary;
        ctx.fillText(char, x, y);
        ctx.shadowBlur = 0;

        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }

    const animId = requestAnimationFrame(draw);
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [config.primary]);

  // CSS Injection: Intermittent Glitch with Fixed Custom Colors
  useEffect(() => {
    const id = "dynamic-theme-glitch-styles";
    if (document.getElementById(id)) document.getElementById(id).remove();

    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      @keyframes intermittentGlitch {
        0%, 88%, 92%, 100% { transform: translate(0, 0); filter: none; opacity: 1; }
        89% { transform: translate(-10px, 4px); filter: contrast(1.2); }
        90% { transform: translate(10px, -4px); }
        91% { transform: translate(-2px, -8px); opacity: 0.9; }
      }

      @keyframes layerJitter {
        0%, 88%, 100% { transform: translate(var(--base-x), var(--base-y)); }
        90% { transform: translate(calc(var(--base-x) + 6px), calc(var(--base-y) - 3px)); }
      }

      .status-wrapper {
        position: relative;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 2rem;
      }

      .glitch-number-container {
        position: relative;
        font-weight: 900;
        font-size: 92px;
        line-height: 1;
        animation: intermittentGlitch 3.5s infinite;
      }

      @media (min-width: 768px) {
        .glitch-number-container { font-size: 145px; }
        .status-wrapper { height: 160px; }
      }

      .layer-1 {
        position: absolute;
        left: 0; top: 0;
        --base-x: 5px; --base-y: -4px;
        transform: translate(var(--base-x), var(--base-y));
        color: ${config.glitch1};
        filter: blur(0.4px);
        mix-blend-mode: screen;
        animation: layerJitter 3.5s infinite linear;
      }

      .layer-2 {
        position: absolute;
        left: 0; top: 0;
        --base-x: -5px; --base-y: 4px;
        transform: translate(var(--base-x), var(--base-y));
        color: ${config.glitch2};
        filter: blur(0.4px);
        mix-blend-mode: screen;
        animation: layerJitter 3.5s infinite linear reverse;
      }

      .layer-main {
        position: relative;
        color: white;
      }

      @keyframes pulseGlowIntense {
        0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
      }
    `;
    document.head.appendChild(style);
  }, [config, statusCode]);

  return (
    <div className="min-h-screen w-full bg-[#050506] relative overflow-hidden flex items-center justify-center p-4">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ opacity: 0.9 }}
      />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/90 z-[1]" />

      <div className="relative z-10 w-full max-w-3xl">
        <div
          className="relative rounded-3xl p-8 md:p-12"
          style={{
            background: "rgba(255, 255, 255, 0.015)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Icon Section */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div
                className="absolute inset-0 blur-3xl rounded-full"
                style={{
                  background: config.glow,
                  width: "110px",
                  height: "110px",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  animation: "pulseGlowIntense 2.5s ease-in-out infinite",
                }}
              />
              <FontAwesomeIcon
                icon={config.icon}
                size="4x"
                style={{
                  color: config.primary,
                  filter: `drop-shadow(0 0 12px ${config.primary})`,
                }}
                className="relative z-10"
              />
            </div>
          </div>

          {/* STATUS CODE SECTION */}
          <div className="status-wrapper">
            <div className="glitch-number-container">
              <span className="layer-1" aria-hidden="true">
                {statusCode}
              </span>
              <span className="layer-2" aria-hidden="true">
                {statusCode}
              </span>
              <span className="layer-main">{statusCode}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 mb-6 opacity-40">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white to-transparent" />
            <span
              className="text-[10px] font-mono tracking-[0.4em] uppercase font-bold"
              style={{ color: config.primary }}
            >
              SYSTEM_FAULT_{statusCode}
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white to-transparent" />
          </div>

          {/* Title & Parameter Message */}
          <div className="text-center space-y-4 mb-10">
            <h2
              className="text-3xl md:text-4xl font-black tracking-tighter"
              style={{
                color: config.primary,
                fontFamily: "'Courier New', monospace",
              }}
            >
              {config.title}
            </h2>
            <p className="text-white/40 text-sm md:text-base max-w-xl mx-auto font-mono leading-relaxed px-4">
              {displayMessage}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="group relative px-10 py-3.5 rounded-xl font-bold text-xs font-mono uppercase tracking-widest transition-all duration-300 hover:scale-105 flex items-center gap-2 text-white overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${config.primary}, ${config.secondary})`,
                boxShadow: `0 8px 25px -5px ${config.glow}`,
              }}
            >
              <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <FontAwesomeIcon icon={faHome} className="relative z-10" />
              <span className="relative z-10">DASHBOARD</span>
            </button>

            <button
              onClick={() => window.history.back()}
              className="px-10 py-3.5 rounded-xl font-bold text-xs font-mono uppercase tracking-widest transition-all duration-300 border border-white/10 text-white/40 hover:text-white hover:bg-white/5"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>GO BACK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 w-full text-center z-20">
        <p
          className="text-[9px] font-mono tracking-[0.5em] uppercase opacity-20"
          style={{ color: config.primary }}
        >
          CORE_NODE: BEKASI_01 // ACCESS_STAMP: {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
