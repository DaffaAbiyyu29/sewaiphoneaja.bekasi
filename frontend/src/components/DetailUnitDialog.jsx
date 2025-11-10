"use client";

import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { iphoneSpecs } from "../data/iphoneSpecs";

export default function DetailUnitDialog({ isOpen, onClose, unit }) {
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [selectedSpec, setSelectedSpec] = useState({
    ipe: "",
    warna: "",
  });
  const [mainImage, setMainImage] = useState("");
  const [thumbStartIndex, setThumbStartIndex] = useState(0);

  useEffect(() => {
    setQuantity(1);
    setSelectedSpec({ tipe: "", warna: "" });
    setThumbStartIndex(0);

    if (unit?.detailImages?.length > 0) {
      setMainImage(unit.detailImages[0]);
    } else {
      setMainImage(unit?.img || "");
    }
  }, [unit]);

  if (!unit) return null;

  // 🔹 Ambil data spesifikasi dari iphoneSpecs
  const specData = iphoneSpecs[unit.model] || {
    price: "Rp -",
    Tipe: [],
    warna: [],
  };

  const handleSelectSpec = (key, value) => {
    setSelectedSpec({ ...selectedSpec, [key]: value });
  };

  // 🔹 Siapkan galeri gambar
  const detailImages = unit.detailImages?.length
    ? unit.detailImages
    : [unit.img, unit.img, unit.img];

  const maxThumbs = 6;
  const visibleThumbs = detailImages.slice(
    thumbStartIndex,
    thumbStartIndex + maxThumbs
  );

  const handlePrevThumbs = () => {
    setThumbStartIndex((prev) => Math.max(0, prev - maxThumbs));
  };

  const handleNextThumbs = () => {
    setThumbStartIndex((prev) =>
      Math.min(prev + maxThumbs, detailImages.length - maxThumbs)
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* BACKDROP */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 backdrop-blur-none"
          enterTo="opacity-100 backdrop-blur-sm"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 backdrop-blur-sm"
          leaveTo="opacity-0 backdrop-blur-none"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        {/* MODAL CONTENT */}
        <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-2"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-2"
          >
            <DialogPanel className="w-full max-w-6xl bg-white rounded-2xl shadow-xl relative flex flex-col md:flex-row gap-4 md:gap-6 overflow-hidden">
              {/* GAMBAR PRODUK */}
              <div className="flex-1 flex flex-col p-3 sm:p-4 bg-gray-50 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
                <div className="flex-1 flex items-center justify-center">
                  <img
                    src={mainImage}
                    alt={unit.model}
                    className="object-contain h-[300px] sm:h-[400px] md:h-[500px] w-full rounded-lg"
                  />
                </div>

                {/* THUMBNAILS */}
                <div className="mt-3 flex items-center gap-2 overflow-x-auto">
                  {thumbStartIndex > 0 && (
                    <button
                      onClick={handlePrevThumbs}
                      className="p-1 bg-blue-900 rounded text-white hover:bg-blue-700"
                    >
                      ‹
                    </button>
                  )}
                  {visibleThumbs.map((img, idx) => (
                    <button
                      key={thumbStartIndex + idx}
                      onClick={() => setMainImage(img)}
                      className={`flex-shrink-0 w-16 sm:w-20 h-16 sm:h-20 border rounded-lg overflow-hidden transition ${
                        mainImage === img
                          ? "border-blue-900"
                          : "border-gray-300 hover:border-blue-700"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`thumb-${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                  {thumbStartIndex + maxThumbs < detailImages.length && (
                    <button
                      onClick={handleNextThumbs}
                      className="p-1 bg-blue-900 rounded text-white hover:bg-blue-700"
                    >
                      ›
                    </button>
                  )}
                </div>
              </div>

              {/* DETAIL PRODUK */}
              <div className="flex-1 flex flex-col justify-between p-4 sm:p-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {unit.model}
                  </h3>
                  <p className="text-lg sm:text-xl text-blue-900 font-semibold mb-4">
                    {specData.price}
                  </p>

                  {/* SPESIFIKASI */}
                  <div className="space-y-4 mb-6">
                    {/* 🔹 Warna */}
                    {specData.warna?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Warna
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {specData.warna.map((color) => (
                            <button
                              key={color}
                              onClick={() => handleSelectSpec("warna", color)}
                              className={`px-3 py-1 border rounded-md text-sm transition ${
                                selectedSpec.warna === color
                                  ? "bg-blue-900 text-white border-blue-900"
                                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-900"
                              }`}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 🔹 Tipe */}
                    {specData.Tipe?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Tipe
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {specData.Tipe.map((tipe) => (
                            <button
                              key={tipe}
                              onClick={() => handleSelectSpec("tipe", tipe)}
                              className={`px-3 py-1 border rounded-md text-sm transition ${
                                selectedSpec.tipe === tipe
                                  ? "bg-blue-900 text-white border-blue-900"
                                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-900"
                              }`}
                            >
                              {tipe}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Jumlah */}
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-gray-700">
                        Jumlah Unit
                      </p>
                      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                        <button
                          onClick={() =>
                            setQuantity((prev) => Math.max(1, prev - 1))
                          }
                          className="px-3 py-1 text-gray-700 hover:bg-gray-100 transition"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 text-gray-900">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity((prev) => prev + 1)}
                          className="px-3 py-1 text-gray-700 hover:bg-gray-100 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {unit.desc ||
                      "Spesifikasi lengkap tersedia sesuai model."}
                  </p>
                </div>

                {/* 🔹 Tombol Sewa Sekarang */}
                <button
                  onClick={() => {
                    onClose();
                    navigate("/unit");
                  }}
                  className="mt-6 w-full bg-blue-900 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 rounded-lg transition"
                >
                  Sewa Sekarang
                </button>
              </div>

              {/* CLOSE BUTTON */}
              <button
                onClick={onClose}
                className="absolute top-2 sm:top-4 right-2 sm:right-4 text-red-700 hover:text-red-900 text-lg sm:text-xl font-bold"
              >
                ✕
              </button>
            </DialogPanel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
