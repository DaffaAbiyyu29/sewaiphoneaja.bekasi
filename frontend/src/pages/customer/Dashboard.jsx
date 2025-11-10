"use client";

import { useEffect, useState } from "react";
import DetailUnitDialog from "../../components/DetailUnitDialog";

export default function Dashboard() {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = (unit) => {
    setSelectedUnit(unit);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  // smooth scroll behavior pas klik anchor link
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

  const units = [
    {
      model: "iPhone 15 Plus",
      price: "Rp 850.000 / bulan",
      img: "https://ibox.co.id/_next/image?url=https%3A%2F%2Fcdnpro.eraspace.com%2Fmedia%2Fcatalog%2Funit%2Fa%2Fp%2Fapple_iphone_15_blue_1_1.jpg&w=3840&q=45",
      desc: "iPhone flagship terbaru dengan chip A17 Pro, kamera ProRAW, dan performa super cepat untuk kebutuhan profesional.",
      detailImages: [
        "https://ibox.co.id/_next/image?url=https%3A%2F%2Fcdnpro.eraspace.com%2Fmedia%2Fcatalog%2Funit%2Fa%2Fp%2Fapple_iphone_15_blue_1_1.jpg&w=3840&q=45",
      ],
    },
    {
      model: "iPhone XR",
      price: "Rp 700.000 / bulan",
      img: "https://i.pinimg.com/736x/9b/dc/a8/9bdca8190cc2869e058a18fc06519e0f.jpg",
      desc: "Performa tinggi dengan Dynamic Island, kamera 48MP, dan baterai awet untuk aktivitas sehari-hari.",
      detailImages: [
        "https://i.pinimg.com/736x/9b/dc/a8/9bdca8190cc2869e058a18fc06519e0f.jpg",
      ],
    },
    {
      model: "iPhone 14",
      price: "Rp 600.000 / bulan",
      img: "https://ibox.co.id/_next/image?url=https%3A%2F%2Fcdnpro.eraspace.com%2Fmedia%2Fcatalog%2Funit%2Fi%2Fp%2Fiphone_14_midnight_1.jpg&w=1920&q=45",
      desc: "Masih powerful dengan chip A15 Bionic dan kamera berkualitas tinggi untuk hasil foto jernih dan tajam.",
      detailImages: [
        "https://ibox.co.id/_next/image?url=https%3A%2F%2Fcdnpro.eraspace.com%2Fmedia%2Fcatalog%2Funit%2Fi%2Fp%2Fiphone_14_starlight_1.jpg&w=1920&q=45",
        "https://ibox.co.id/_next/image?url=https%3A%2F%2Fcdnpro.eraspace.com%2Fmedia%2Fcatalog%2Funit%2Fi%2Fp%2Fiphone_14_midnight_1.jpg&w=1920&q=45",
      ],
    },
    {
      model: "iPhone 13",
      price: "Rp 550.000 / bulan",
      img: "https://i.pinimg.com/1200x/a5/84/b7/a584b7b1bbae0b02a4297b8644e01498.jpg",
      desc: "Pilihan hemat dengan performa tinggi dan desain modern, cocok untuk kamu yang ingin tampil stylish.",
      detailImages: [
        "https://i.pinimg.com/1200x/4b/52/61/4b526157acf8ddd10ed374d5cc841c51.jpg",
      ],
    },
    {
      model: "iPhone X",
      price: "Rp 550.000 / bulan",
      img: "https://i.pinimg.com/736x/69/91/81/69918186ea86921b28b8900f3aed3312.jpg",
      desc: "Pilihan hemat dengan performa tinggi dan desain modern, cocok untuk kamu yang ingin tampil stylish.",
      detailImages: [
        "https://i.pinimg.com/736x/69/91/81/69918186ea86921b28b8900f3aed3312.jpg",
      ],
    },
    {
      model: "iPhone 11",
      price: "Rp 550.000 / bulan",
      img: "https://i.pinimg.com/1200x/43/47/41/4347411103750db832be1af82c622c7c.jpg",
      desc: "Pilihan hemat dengan performa tinggi dan desain modern, cocok untuk kamu yang ingin tampil stylish.",
      detailImages: [
        "https://i.pinimg.com/1200x/43/47/41/4347411103750db832be1af82c622c7c.jpg",
        "https://i.pinimg.com/736x/dc/3b/96/dc3b9684af282bbbf71755affd1e76a8.jpg",
        "https://i.pinimg.com/736x/5a/58/88/5a5888e6bb65ae4f5ae738af768ca5d6.jpg",
      ],
    },
    {
      model: "iPhone 12",
      price: "Rp 550.000 / bulan",
      img: "https://i.pinimg.com/736x/3d/79/f3/3d79f3f0f1c0b7f4221b441de61a0f73.jpg",
      desc: "Pilihan hemat dengan performa tinggi dan desain modern, cocok untuk kamu yang ingin tampil stylish.",
      detailImages: [
        "https://i.pinimg.com/1200x/43/47/41/4347411103750db832be1af82c622c7c.jpg",
        "https://i.pinimg.com/736x/5a/58/88/5a5888e6bb65ae4f5ae738af768ca5d6.jpg",
      ],
    },
  ];

  return (
    <div className="bg-white min-h-screen overflow-hidden scroll-smooth">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        {/* background blur atas */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-gradient-to-tr from-blue-400 to-blue-900 opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
          />
        </div>

        {/* hero */}
        <div className="mx-auto max-w-2xl py-28 sm:py-44 lg:py-48 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-gray-900 text-center">
            sewaiphoneaja.bekasi
          </h1>

          <p className="mt-6 text-lg text-gray-600">
            Layanan penyewaan iPhone dengan harga terjangkau, unit original, dan
            pengiriman cepat ke seluruh Indonesia.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#daftar-iphone"
              className="rounded-md bg-blue-900 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-blue-800 transition"
            >
              Lihat iPhone Tersedia
            </a>
            <a
              href="/contact"
              className="text-sm font-semibold text-blue-900 hover:text-blue-700 transition"
            >
              Hubungi Kami <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* divider */}
        <div className="border-t border-gray-200 my-20" />

        {/* penjelasan singkat */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-yellow-400 p-10 shadow-lg text-center text-white">
            <h2 className="text-2xl font-bold mb-4">sewaiphoneaja.bekasi</h2>
            <p className="text-base leading-relaxed text-white/90">
              Kami hadir untuk memudahkan kamu mendapatkan pengalaman
              menggunakan iPhone tanpa harus membeli mahal. Semua unit kami
              original, berkualitas tinggi, dan selalu dalam kondisi terbaik.
            </p>
          </div>
        </div>

        {/* divider */}
        <div className="border-t border-gray-200 my-20" />

        {/* daftar iphone */}
        <div id="daftar-iphone" className="max-w-6xl mx-auto mb-20 px-4">
          <h2 className="text-3xl font-bold mb-10 text-gray-900 text-center">
            iPhone Tersedia
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {units.map((p, i) => (
              <div
                key={i}
                onClick={() => openModal(p)}
                className="group relative cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="bg-gradient-to-b from-gray-50 to-white flex items-center justify-center h-56">
                  <img
                    src={p.img}
                    alt={p.model}
                    className="h-44 object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="border-t border-gray-100" />

                <div className="p-5 text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {p.model}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 mb-4">{p.price}</p>

                  <button className="w-full bg-blue-900 hover:bg-blue-800 text-white rounded-lg py-2 text-sm font-medium transition">
                    Lihat Detail
                  </button>
                </div>

                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-600 to-yellow-400 opacity-0 group-hover:opacity-100 transition" />
              </div>
            ))}
          </div>
        </div>

        {/* MODAL DETAIL */}
        <DetailUnitDialog
          isOpen={isOpen}
          onClose={closeModal}
          unit={selectedUnit}
        />

        {/* divider */}
        <div className="border-t border-gray-200 my-20" />

        {/* testimoni */}
        <section className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">
            Apa Kata Mereka?
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Rizky Ananda",
                comment:
                  "Pelayanan super cepat! iPhone langsung dikirim ke rumah, kondisi mulus banget.",
              },
              {
                name: "Nabila Putri",
                comment:
                  "Sangat recommended, adminnya responsif dan prosesnya gampang.",
              },
              {
                name: "Yoga Saputra",
                comment:
                  "Coba sewa buat event kantor, semuanya lancar dan iPhone-nya oke banget!",
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-6 shadow-md border border-gray-100 bg-gradient-to-br from-blue-50 to-yellow-50 hover:shadow-lg transition"
              >
                <p className="text-gray-700 text-sm italic">“{t.comment}”</p>
                <p className="mt-4 font-semibold text-blue-900">{t.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* divider */}
        <div className="border-t border-gray-200 my-20" />

        {/* CTA terakhir */}
        <div className="max-w-4xl mx-auto text-center mb-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sewa iPhone Sekarang?
          </h2>
          <p className="text-gray-600 mb-6">
            Pilih iPhone favoritmu dan nikmati kemudahan penyewaan hanya dengan
            beberapa klik.
          </p>
          <button className="bg-blue-900 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg transition">
            Mulai Sewa Sekarang
          </button>
        </div>

        {/* background bawah */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-gradient-to-tr from-blue-400 to-yellow-300 opacity-30 sm:left-[calc(50%+36rem)] sm:w-288.75"
          />
        </div>
      </div>
    </div>
  );
}
