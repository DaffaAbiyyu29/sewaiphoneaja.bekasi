// Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top section: Logo + Links */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <img
              src="/images/sewaiphoneaja.png"
              alt="Sewa iPhone Aja"
              className="h-10 w-auto"
            />
            <span className="font-bold text-lg">sewaiphoneaja.bekasi</span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/"
              className="hover:text-white transition-colors text-sm font-medium"
            >
              Dashboard
            </a>
            <a
              href="/unit"
              className="hover:text-white transition-colors text-sm font-medium"
            >
              Unit
            </a>
            <a
              href="/contact"
              className="hover:text-white transition-colors text-sm font-medium"
            >
              Contact
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6" />

        {/* Bottom section: Copyright */}
        <p className="text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} sewaiphoneaja.bekasi. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
