// Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <img
              src="/images/sewaiphoneaja.png"
              alt="Sewa iPhone Aja"
              className="h-7 w-auto opacity-80"
            />
            <span className="text-sm font-semibold tracking-wide">
              sewaiphoneaja.bekasi
            </span>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
