import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faMobileScreen,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import {
  faInstagram,
  faWhatsapp,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons"; // Import brand icons

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-14 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Grid Section */}
        <div className="grid md:grid-cols-5 gap-10 md:gap-8 lg:gap-16 mb-12">
          {/* Company Info (1st Column - Wider) */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              {/* Logo/Image Section */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-800 p-1">
                <img
                  src="/images/sewaiphoneaja.png"
                  alt="Sewa iPhone Aja Logo"
                  className="h-full w-auto object-contain"
                />
              </div>
              <span className="text-2xl font-extrabold tracking-tight">
                sewaiphoneaja<span className="text-sky-400">.bekasi</span>
              </span>
            </div>
            <p className="text-gray-400 max-w-sm leading-relaxed">
              Layanan penyewaan iPhone terpercaya, cepat, dan termurah di
              Bekasi. #MewahGakHarusMahal
            </p>
          </div>

          {/* Produk (2nd Column) */}
          <div>
            <h4 className="font-bold text-lg mb-5 text-sky-400">Produk</h4>
            <ul className="space-y-3 text-gray-300">
              <li>
                <a
                  href="/produk/iphone-15"
                  className="hover:text-white transition-colors duration-200"
                >
                  iPhone 15 Series
                </a>
              </li>
              <li>
                <a
                  href="/produk/iphone-14"
                  className="hover:text-white transition-colors duration-200"
                >
                  iPhone 14 Series
                </a>
              </li>
              <li>
                <a
                  href="/produk/iphone-13"
                  className="hover:text-white transition-colors duration-200"
                >
                  iPhone 13 Series
                </a>
              </li>
              <li>
                <a
                  href="/produk/lainnya"
                  className="hover:text-white transition-colors duration-200"
                >
                  Tipe Lainnya
                </a>
              </li>
            </ul>
          </div>

          {/* Perusahaan (3rd Column) */}
          <div>
            <h4 className="font-bold text-lg mb-5 text-sky-400">Perusahaan</h4>
            <ul className="space-y-3 text-gray-300">
              <li>
                <a
                  href="/tentang"
                  className="hover:text-white transition-colors duration-200"
                >
                  Tentang Kami
                </a>
              </li>
              <li>
                <a
                  href="/syarat"
                  className="hover:text-white transition-colors duration-200"
                >
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a
                  href="/privasi"
                  className="hover:text-white transition-colors duration-200"
                >
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="hover:text-white transition-colors duration-200"
                >
                  Bantuan & FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Kontak & Social (4th Column) */}
          <div>
            <h4 className="font-bold text-lg mb-5 text-sky-400">Kontak</h4>
            <ul className="space-y-3 text-gray-300 mb-6">
              <li className="flex items-center space-x-2">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-sky-400 w-4 h-4"
                />
                <a
                  href="mailto:info@sewaiphoneaja.com"
                  className="hover:text-white transition-colors duration-200 text-sm"
                >
                  info@sewaiphoneaja.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <FontAwesomeIcon
                  icon={faMobileScreen}
                  className="text-sky-400 w-4 h-4"
                />
                <a
                  href="tel:+6281234567890"
                  className="hover:text-white transition-colors duration-200 text-sm"
                >
                  +62 812-3456-7890
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="text-sky-400 mt-1 w-4 h-4"
                />
                <span className="text-sm">Bekasi, Indonesia</span>
              </li>
            </ul>

            <h5 className="font-semibold mb-3 text-gray-200">Ikuti Kami</h5>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/sewaiphoneaja.bekasi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faInstagram} size="xl" />
              </a>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-500 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faWhatsapp} size="xl" />
              </a>
              <a
                href="https://tiktok.com/@sewaiphoneaja.bekasi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faTiktok} size="xl" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-800/70 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2025 sewaiphoneaja.bekasi. All rights reserved. |{" "}
            <a href="/sitemap" className="hover:text-sky-400 transition-colors">
              Sitemap
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
