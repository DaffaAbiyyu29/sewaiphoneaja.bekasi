"use client";

import { useEffect, useState } from "react";
import SkeletonCard from "../../components/SkeletonCard";
import DetailUnitDialog from "../../components/DetailUnitDialog";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBoxesPacking,
  faClock,
  faMobileScreen,
  faShield,
  faStar,
  faZap,
} from "@fortawesome/free-solid-svg-icons";

export default function Dashboard() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // State untuk data API
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const openModal = (unit) => {
    setSelectedUnit(unit);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  // useEffect untuk smooth scroll (sudah bagus, dipertahankan)
  useEffect(() => {
    const handleSmoothScroll = (e) => {
      if (
        e.target.tagName === "A" &&
        e.target.getAttribute("href")?.startsWith("#")
      ) {
        e.preventDefault();
        const id = e.target.getAttribute("href").slice(1);
        const target = document.getElementById(id);
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 80,
            behavior: "smooth",
          });
        }
      }
    };

    document.addEventListener("click", handleSmoothScroll);
    return () => document.removeEventListener("click", handleSmoothScroll);
  }, []);

  // useEffect baru untuk fetch data dari API
  useEffect(() => {
    const fetchUnits = async () => {
      // Contoh: "https://api.sewaiphone.com/images/" atau "/uploads/"
      const IMAGE_BASE_URL = `${API_URL}/get-image/`; // <-- SESUAIKAN INI

      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/api/unit/catalog`);
        console.log(response);
        if (!response.data.success) {
          throw new Error("Gagal mengambil data dari server");
        }

        const data = response.data;

        if (data && data.success && Array.isArray(data.data)) {
          // "Adapter" - Mengubah data API agar sesuai dengan format yang
          // diharapkan oleh komponen (DetailUnitDialog & Card)
          const formattedUnits = data.data.map((unit) => {
            // Format harga
            const priceInfo =
              unit.prices.length > 0
                ? `Rp ${new Intl.NumberFormat("id-ID").format(
                    unit.prices[0].price_per_day
                  )} / hari`
                : "Hubungi Admin";

            // Ambil gambar utama & gambar detail dari varian
            const mainImage = unit.photo
              ? `${IMAGE_BASE_URL}${unit.photo}`
              : null;
            const detailImages =
              unit.variants.length > 0
                ? unit.variants.map(
                    (variant) => `${IMAGE_BASE_URL}${variant.photo}`
                  )
                : [mainImage]; // Fallback jika tidak ada varian

            return {
              model: unit.unit_name,
              price: priceInfo,
              img: mainImage,
              desc:
                unit.description ||
                `Sewa ${unit.unit_name} sekarang dengan penawaran terbaik.`, // Fallback deskripsi
              detailImages: detailImages,
              // ...simpan data asli jika diperlukan modal
              originalData: unit,
            };
          });
          setUnits(formattedUnits);
        } else {
          throw new Error("Format data tidak sesuai");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching units:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnits();
  }, []); // Dependency array kosong, fetch 1x saat mount

  // Data 'units' yang lama sudah dihapus

  const features = [
    {
      icon: faShield,
      title: "Unit Original",
      desc: "100% iPhone original dengan garansi kualitas",
    },
    {
      icon: faClock,
      title: "Sewa Fleksibel",
      desc: "Pilih durasi sewa sesuai kebutuhan Anda",
    },
    {
      icon: faZap,
      title: "Proses Cepat",
      desc: "Booking mudah dan approval dalam hitungan menit",
    },
    {
      icon: faBoxesPacking,
      title: "Kondisi Prima",
      desc: "Semua device terawat dan siap pakai",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold">
                  🎉 Promo Spesial - Diskon 20% untuk Sewa Mingguan!
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Sewa iPhone
                <span className="block bg-gradient-to-r from-blue-900 via-blue-700 to-gray-900 bg-clip-text text-transparent">
                  Terbaru di Bekasi
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Nikmati pengalaman menggunakan iPhone flagship tanpa harus
                membeli. Unit original, harga terjangkau, dan proses mudah.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#daftar-iphone"
                  className="group bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl flex items-center justify-center space-x-2"
                >
                  <span>Lihat iPhone Tersedia</span>
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  />
                </a>
                <a
                  href="#kontak"
                  className="border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center"
                >
                  Hubungi Admin
                </a>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                <div>
                  <p className="text-3xl font-bold text-blue-900">500+</p>
                  <p className="text-sm text-gray-600 mt-1">Transaksi Sukses</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-900">4.9</p>
                  <p className="text-sm text-gray-600 mt-1">Rating Customer</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-900">24/7</p>
                  <p className="text-sm text-gray-600 mt-1">Customer Support</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="relative transform hover:scale-[1.02] transition-transform duration-500 ease-in-out">
                {/* Efek Latar Belakang Kotak Foto */}
                <div className="absolute inset-0 bg-blue-100 rounded-4xl transform rotate-3 shadow-xl"></div>
                <div className="absolute inset-0 bg-yellow-100 rounded-4xl transform -rotate-3 shadow-xl"></div>

                {/* Kotak Foto Utama */}
                <div className="relative bg-[#FAFAFA] rounded-4xl p-5 shadow-3xl transform">
                  <div className="text-center">
                    {/* Mengganti gambar dengan yang lebih relevan dan jelas, tambahkan shadow */}

                    {/* Gunakan image asset Anda yang relevan */}
                    <img
                      src="https://www.apple.com/v/iphone/home/cb/images/overview/welcome/switch/welcome__n6xy87ib1gyu_large.jpg" // Ganti dengan gambar produk iPhone Anda yang fokus
                      alt="iPhone Terbaru Siap Disewa di Bekasi"
                      className="rounded-2xl mx-auto max-h-[500px] object-contain transform hover:rotate-1 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Mengapa Pilih Kami?
            </h2>
            <p className="text-xl text-gray-600">
              Layanan terbaik untuk pengalaman sewa yang sempurna
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FontAwesomeIcon
                    icon={feature.icon}
                    className="w-7 h-7 text-blue-900"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* iPhone Catalog */}
      <section id="daftar-iphone" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              iPhone Tersedia
            </h2>
            <p className="text-xl text-gray-600">
              Pilih iPhone favoritmu dan mulai sewa hari ini
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading ? (
              [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-block p-4 bg-red-50 rounded-2xl mb-4">
                  <svg
                    className="w-12 h-12 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-red-600 font-semibold">
                  Terjadi kesalahan: {error}
                </p>
              </div>
            ) : units.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  Belum ada unit iPhone yang tersedia saat ini.
                </p>
              </div>
            ) : (
              units.map((unit, i) => (
                <div
                  key={i}
                  onClick={() => openModal(unit)}
                  className="group relative cursor-pointer bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold z-10">
                    Tersedia
                  </div>

                  <div className="bg-gradient-to-b from-gray-50 to-white flex items-center justify-center h-64 p-6">
                    {unit.img ? (
                      <img
                        src={unit.img}
                        alt={unit.model}
                        className="h-52 object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-2xl flex flex-col items-center justify-center">
                        <svg
                          className="w-16 h-16 text-gray-300 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-gray-400 text-sm font-medium">
                          No Image
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100" />

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center group-hover:text-blue-900 transition">
                      {unit.model}
                    </h3>
                    <p className="text-center text-blue-900 font-bold text-lg mb-4">
                      {unit.price}
                    </p>

                    <button className="w-full bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white rounded-xl py-3 text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                      <span>Lihat Detail</span>
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="w-4 h-4"
                      />
                    </button>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-600 to-yellow-400 opacity-0 group-hover:opacity-100 transition" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Modal */}
      <DetailUnitDialog
        isOpen={isOpen}
        onClose={closeModal}
        unit={selectedUnit}
      />

      {/* Testimonials */}
      <section
        id="testimoni"
        className="py-20 px-6 bg-gradient-to-b from-white to-gray-50"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Apa Kata Mereka?
            </h2>
            <p className="text-xl text-gray-600">
              Testimoni dari customer yang puas
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Rizky Ananda",
                rating: 5,
                comment:
                  "Pelayanan super cepat! iPhone langsung dikirim ke rumah, kondisi mulus banget.",
              },
              {
                name: "Nabila Putri",
                rating: 5,
                comment:
                  "Sangat recommended, adminnya responsif dan prosesnya gampang.",
              },
              {
                name: "Yoga Saputra",
                rating: 5,
                comment:
                  "Coba sewa buat event kantor, semuanya lancar dan iPhone-nya oke banget!",
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <FontAwesomeIcon
                      icon={faStar}
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 text-base italic mb-6">
                  "{t.comment}"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
                    <span className="text-blue-900 font-bold text-lg">
                      {t.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">Customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="kontak" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 rounded-3xl p-12 shadow-2xl text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-300 rounded-full opacity-10 translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">
                Siap Sewa iPhone Sekarang?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Hubungi kami sekarang dan dapatkan iPhone impianmu dengan harga
                terjangkau
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl">
                  WhatsApp Admin
                </button>
                <button className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-xl font-bold transition-all duration-300">
                  Lihat Katalog
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
