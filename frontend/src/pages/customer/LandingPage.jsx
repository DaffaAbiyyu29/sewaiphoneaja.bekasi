"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShield,
  faClock,
  faArrowTrendUp,
  faBoxesPacking,
  faChevronRight,
  faStar,
  faMobileScreen,
} from "@fortawesome/free-solid-svg-icons";

export default function LandingPage() {
  const iphones = [
    {
      name: "iPhone 15 Pro Max",
      storage: "256GB",
      price: "150.000",
      image: "📱",
      color: "Natural Titanium",
    },
    {
      name: "iPhone 15 Pro",
      storage: "128GB",
      price: "130.000",
      image: "📱",
      color: "Blue Titanium",
    },
    {
      name: "iPhone 15",
      storage: "128GB",
      price: "100.000",
      image: "📱",
      color: "Black",
    },
    {
      name: "iPhone 14 Pro",
      storage: "256GB",
      price: "120.000",
      image: "📱",
      color: "Deep Purple",
    },
    {
      name: "iPhone 14",
      storage: "128GB",
      price: "85.000",
      image: "📱",
      color: "Purple",
    },
    {
      name: "iPhone 13",
      storage: "128GB",
      price: "70.000",
      image: "📱",
      color: "Pink",
    },
  ];

  const features = [
    {
      icon: faShield,
      title: "Garansi Aman",
      desc: "Semua device застрахованы dan dilindungi asuransi",
    },
    {
      icon: faClock,
      title: "Fleksibel",
      desc: "Sewa harian, mingguan, atau bulanan",
    },
    {
      icon: faArrowTrendUp,
      title: "Harga Terjangkau",
      desc: "Nikmati iPhone flagship dengan budget hemat",
    },
    {
      icon: faBoxesPacking,
      title: "Kondisi Prima",
      desc: "Semua device terawat dan berfungsi sempurna",
    },
  ];

  const testimonials = [
    {
      name: "Budi Santoso",
      rating: 5,
      text: "Pelayanan cepat dan iPhone yang disewakan dalam kondisi sangat baik!",
      role: "Content Creator",
    },
    {
      name: "Siti Nurhaliza",
      rating: 5,
      text: "Harga terjangkau, proses mudah. Recommended!",
      role: "Fotografer",
    },
    {
      name: "Andi Wijaya",
      rating: 5,
      text: "Sempurna untuk testing device sebelum beli. Puas banget!",
      role: "Tech Reviewer",
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Sewa iPhone Terbaru Mulai dari Rp70.000/Hari
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Nikmati pengalaman menggunakan iPhone flagship tanpa harus
                membeli. Proses cepat, aman, dan terpercaya.
              </p>
              <div className="flex space-x-4">
                <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center">
                  Mulai Sewa{" "}
                  <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
                </button>
                <button className="border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
                  Lihat Katalog
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="text-9xl">📱</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Mengapa Pilih Kami?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <FontAwesomeIcon
                  icon={feature.icon}
                  className="w-12 h-12 text-blue-600 mb-4"
                />
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* iPhone Catalog */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Katalog iPhone
          </h2>
          <p className="text-center text-gray-600 mb-16">
            Pilih iPhone favoritmu dan mulai sewa sekarang
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {iphones.map((phone, idx) => (
              <div
                key={idx}
                className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition"
              >
                <div className="text-6xl mb-4 text-center">{phone.image}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  {phone.name}
                </h3>
                <p className="text-gray-600 mb-1">{phone.storage}</p>
                <p className="text-sm text-gray-500 mb-4">{phone.color}</p>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">Mulai dari</p>
                  <p className="text-3xl font-bold text-blue-600 mb-4">
                    Rp{phone.price}
                    <span className="text-lg text-gray-600">/hari</span>
                  </p>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                    Sewa Sekarang
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Paket Sewa Fleksibel
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                duration: "Harian",
                price: "100.000",
                desc: "Cocok untuk testing singkat",
                discount: "",
              },
              {
                duration: "Mingguan",
                price: "600.000",
                desc: "Hemat 14% dari harian",
                discount: "Hemat Rp100.000",
                popular: true,
              },
              {
                duration: "Bulanan",
                price: "2.000.000",
                desc: "Hemat 33% dari harian",
                discount: "Hemat Rp1.000.000",
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-xl p-8 ${
                  plan.popular
                    ? "ring-4 ring-blue-600 relative"
                    : "border-2 border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Paling Populer
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-gray-900">
                  {plan.duration}
                </h3>
                <p className="text-4xl font-bold text-blue-600 mb-2">
                  Rp{plan.price}
                </p>
                <p className="text-gray-600 mb-4">{plan.desc}</p>
                {plan.discount && (
                  <p className="text-green-600 font-semibold mb-4">
                    ✓ {plan.discount}
                  </p>
                )}
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  Pilih Paket
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Apa Kata Mereka?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-6">
                <div className="flex mb-4">
                  {[...Array(test.rating)].map((_, i) => (
                    <FontAwesomeIcon
                      icon={faStar}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{test.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{test.name}</p>
                  <p className="text-sm text-gray-600">{test.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Siap Mencoba iPhone Impianmu?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Proses cepat dan mudah. Dapatkan iPhone favoritmu hari ini!
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition">
            Mulai Sewa Sekarang
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FontAwesomeIcon icon={faMobileScreen} className="w-8 h-8" />
                <span className="text-xl font-bold">iRent</span>
              </div>
              <p className="text-gray-400">
                Layanan penyewaan iPhone terpercaya di Indonesia
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-gray-400">
                <li>iPhone 15 Series</li>
                <li>iPhone 14 Series</li>
                <li>iPhone 13 Series</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Tentang Kami</li>
                <li>Syarat & Ketentuan</li>
                <li>Kebijakan Privasi</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📧 info@irent.com</li>
                <li>📱 +62 812-3456-7890</li>
                <li>📍 Jakarta, Indonesia</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 iRent. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
