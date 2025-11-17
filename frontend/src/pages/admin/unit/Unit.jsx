import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import DetailUnitDialog from "../../components/DetailUnitDialog"; // ✅ panggil komponen dialog
import Input from "../../components/Input";

const Unit = () => {
  const iphones = [
    {
      id: 1,
      name: "iPhone 15 Plus",
      image:
        "https://ibox.co.id/_next/image?url=https%3A%2F%2Fcdnpro.eraspace.com%2Fmedia%2Fcatalog%2Fproduct%2Fa%2Fp%2Fapple_iphone_15_blue_1_1.jpg&w=3840&q=45",
      price: "Rp 450.000 / minggu",
      detailImages: [
        "https://ibox.co.id/_next/image?url=https%3A%2F%2Fcdnpro.eraspace.com%2Fmedia%2Fcatalog%2Fproduct%2Fa%2Fp%2Fapple_iphone_15_blue_1_1.jpg&w=3840&q=45",
      ],
      status: "Tersedia",
    },
    {
      id: 2,
      name: "iPhone XR",
      image:
        "https://i.pinimg.com/736x/9b/dc/a8/9bdca8190cc2869e058a18fc06519e0f.jpg",
      price: "Rp 550.000 / minggu",
      detailImages: [
        "https://i.pinimg.com/736x/9b/dc/a8/9bdca8190cc2869e058a18fc06519e0f.jpg",
      ],
      status: "Tersedia",
    },
    {
      id: 3,
      name: "iPhone 15 Plus",
      image:
        "https://ibox.co.id/_next/image?url=https%3A%2F%2Fcdnpro.eraspace.com%2Fmedia%2Fcatalog%2Fproduct%2Fa%2Fp%2Fapple_iphone_15_pro_blue_titanium_1_6.jpg&w=1920&q=45",
      price: "Rp 350.000 / minggu",
      detailImages: [
        "https://ibox.co.id/_next/image?url=https%3A%2F%2Fcdnpro.eraspace.com%2Fmedia%2Fcatalog%2Fproduct%2Fa%2Fp%2Fapple_iphone_15_pro_blue_titanium_1_6.jpg&w=1920&q=45",
        "https://ibox.co.id/_next/image?url=https%3A%2F%2Fcdnpro.eraspace.com%2Fmedia%2Fcatalog%2Fproduct%2Fa%2Fp%2Fapple_iphone_15_pro_natural_titanium_1_4.jpg&w=1920&q=45",
        "https://ibox.co.id/_next/image?url=https%3A%2F%2Fcdnpro.eraspace.com%2Fmedia%2Fcatalog%2Fproduct%2Fa%2Fp%2Fapple_iphone_15_pro_white_titanium_1_4.jpg&w=1920&q=45",
        "https://ibox.co.id/_next/image?url=https%3A%2F%2Fcdnpro.eraspace.com%2Fmedia%2Fcatalog%2Fproduct%2Fa%2Fp%2Fapple_iphone_15_pro_black_titanium_1_4.jpg&w=1920&q=45",
      ],
      status: "Disewa",
    },
    {
      id: 4,
      name: "iPhone 14",
      image:
        "https://ibox.co.id/_next/image?url=https%3A%2F%2Fcdnpro.eraspace.com%2Fmedia%2Fcatalog%2Fproduct%2Fi%2Fp%2Fiphone_14_midnight_1.jpg&w=1920&q=45",
      price: "Rp 550.000 / minggu",
      detailImages: [
        "https://ibox.co.id/_next/image?url=https%3A%2F%2Fcdnpro.eraspace.com%2Fmedia%2Fcatalog%2Fproduct%2Fi%2Fp%2Fiphone_14_starlight_1.jpg&w=1920&q=45",
        "https://ibox.co.id/_next/image?url=https%3A%2F%2Fcdnpro.eraspace.com%2Fmedia%2Fcatalog%2Fproduct%2Fi%2Fp%2Fiphone_14_midnight_1.jpg&w=1920&q=45",
      ],
      status: "Tersedia",
    },
    {
      id: 5,
      name: "iPhone 13",
      image:
        "https://i.pinimg.com/1200x/a5/84/b7/a584b7b1bbae0b02a4297b8644e01498.jpg",
      price: "Rp 550.000 / minggu",
      detailImages: [
        "https://ibox.co.id/_next/image?url=https%3A%2F%2Fcdnpro.eraspace.com%2Fmedia%2Fcatalog%2Fproduct%2Fi%2Fp%2Fiphone_13_midnight_1.jpg&w=1920&q=45",
        "https://ibox.co.id/_next/image?url=https%3A%2F%2Fcdnpro.eraspace.com%2Fmedia%2Fcatalog%2Fproduct%2Fi%2Fp%2Fiphone_13_starlight_1.jpg&w=1920&q=45",
      ],
      status: "Tersedia",
    },
    {
      id: 6,
      name: "iPhone X",
      image:
        "https://www.mobiledokan.com/media/apple-iphone-x-silver-image.webp",
      price: "Rp 550.000 / minggu",
      detailImages: [
        "https://ibox.co.id/_next/image?url=https%3A%2F%2Fcdnpro.eraspace.com%2Fmedia%2Fcatalog%2Fproduct%2Fi%2Fp%2Fiphone_13_midnight_1.jpg&w=1920&q=45",
      ],
      status: "Tersedia",
    },
    {
      id: 7,
      name: "iPhone 11",
      image:
        "https://i.pinimg.com/1200x/43/47/41/4347411103750db832be1af82c622c7c.jpg",
      price: "Rp 550.000 / minggu",
      detailImages: [
        "https://i.pinimg.com/1200x/43/47/41/4347411103750db832be1af82c622c7c.jpg",
        "https://i.pinimg.com/736x/b0/c1/54/b0c154c6bd2b5026501ffd13d4deb298.jpg",
        "https://i.pinimg.com/736x/5a/58/88/5a5888e6bb65ae4f5ae738af768ca5d6.jpg",
      ],
      status: "Tersedia",
    },
    {
      id: 8,
      name: "iPhone 12",
      image:
        "https://i.pinimg.com/736x/3d/79/f3/3d79f3f0f1c0b7f4221b441de61a0f73.jpg",
      price: "Rp 550.000 / minggu",
      detailImages: [
        "https://i.pinimg.com/1200x/43/47/41/4347411103750db832be1af82c622c7c.jpg",
        "https://i.pinimg.com/736x/b0/c1/54/b0c154c6bd2b5026501ffd13d4deb298.jpg",
        "https://i.pinimg.com/736x/5a/58/88/5a5888e6bb65ae4f5ae738af768ca5d6.jpg",
      ],
      status: "Tersedia",
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null); // ✅ simpan unit yang diklik
  const [isDialogOpen, setIsDialogOpen] = useState(false); // ✅ atur buka/tutup modal

  const filteredIphones = iphones.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDetail = (unit) => {
    setSelectedUnit(unit);
    setIsDialogOpen(true);
  };

    const closeModal = () => setIsDialogOpen(false);

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-6 sm:px-10 lg:px-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Daftar Unit iPhone
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Pilih unit iPhone yang ingin Anda sewa. Semua unit kami original,
          kondisi mulus, dan siap dikirim ke seluruh Indonesia.
        </p>

        {/* Search Bar */}
        <div className="flex justify-center">
          <div className="relative w-full sm:w-96">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Cari iPhone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Grid daftar iPhone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredIphones.length > 0 ? (
          filteredIphones.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow hover:shadow-xl transition p-6 flex flex-col items-center text-center"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-52 w-auto object-contain mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-800">
                {item.name}
              </h2>
              <p className="text-gray-500 mt-2">{item.price}</p>
              <span
                className={`mt-3 px-3 py-1 rounded-full text-sm ${
                  item.status === "Tersedia"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {item.status}
              </span>

              <button
                className={`mt-5 w-full py-2 rounded-md text-white font-medium transition ${
                  item.status === "Tersedia"
                    ? "bg-blue-900 hover:bg-blue-800"
                    : "bg-red-600 cursor-not-allowed opacity-80"
                }`}
                disabled={item.status !== "Tersedia"}
                onClick={() => handleOpenDetail(item)} // ✅ buka detail saat diklik
              >
                {item.status === "Tersedia" ? "Pilih Unit" : "Tidak Tersedia"}
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            Tidak ada iPhone yang cocok dengan pencarian "{searchTerm}".
          </p>
        )}
      </div>

      {/* ✅ Dialog Detail Unit */}
      <DetailUnitDialog
        isOpen={isDialogOpen}
        onClose={closeModal}
        unit={selectedUnit}
      />
    </div>
  );
};

export default Unit;
