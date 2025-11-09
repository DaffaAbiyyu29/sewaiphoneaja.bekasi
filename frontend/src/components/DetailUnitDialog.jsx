"use client";

import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";

export default function DetailUnitDialog({ isOpen, onClose, product }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSpec, setSelectedSpec] = useState({
    tipe: "",
    warna: "",
    ram: "",
    penyimpanan: "",
  });
  const [mainImage, setMainImage] = useState("");
  const [thumbStartIndex, setThumbStartIndex] = useState(0); // untuk galeri 6 thumbnail max

  useEffect(() => {
    setQuantity(1);
    setSelectedSpec({
      tipe: "",
      warna: "",
      ram: "",
      penyimpanan: "",
    });
    setThumbStartIndex(0);

    if (product?.detailImages && product.detailImages.length > 0) {
      setMainImage(product.detailImages[0]);
    } else {
      setMainImage(product?.img || "");
    }
  }, [product]);

  if (!product) return null;

  const specs = {
    tipe: ["Standard", "Pro", "Pro Max"],
    warna: ["Hitam", "Putih", "Gold", "Biru"],
    ram: ["6GB", "8GB", "12GB"],
    penyimpanan: ["128GB", "256GB", "512GB"],
  };

  const handleSelectSpec = (key, value) => {
    setSelectedSpec({ ...selectedSpec, [key]: value });
  };

  const detailImages = product.detailImages?.length
    ? product.detailImages
    : [product.img, product.img, product.img];

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
              {/* GAMBAR UNIT */}
              <div className="flex-1 flex flex-col p-2 sm:p-4 bg-gray-50 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
                <div className="flex-1 flex items-center justify-center">
                  <img
                    src={mainImage}
                    alt={product.model}
                    className="object-contain h-[300px] sm:h-[400px] md:h-[500px] w-full rounded-lg"
                  />
                </div>

                {/* THUMBNAILS */}
                <div className="mt-2 sm:mt-4 flex items-center gap-1 sm:gap-2 overflow-x-auto">
                  {thumbStartIndex > 0 && (
                    <button
                      onClick={handlePrevThumbs}
                      className="p-1 bg-blue-900 rounded hover:bg-blue-700 flex-shrink-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4 sm:w-5 sm:h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.72 9.47a.75.75 0 0 0 0 1.06l4.25 4.25a.75.75 0 1 0 1.06-1.06L6.31 10l3.72-3.72a.75.75 0 1 0-1.06-1.06L4.72 9.47Zm9.25-4.25L9.72 9.47a.75.75 0 0 0 0 1.06l4.25 4.25a.75.75 0 1 0 1.06-1.06L11.31 10l3.72-3.72a.75.75 0 0 0-1.06-1.06Z"
                          clipRule="evenodd"
                        />
                      </svg>
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
                      className="p-1 bg-blue-900 rounded hover:bg-blue-700 flex-shrink-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4 sm:w-5 sm:h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M15.28 9.47a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L13.69 10 9.97 6.28a.75.75 0 0 1 1.06-1.06l4.25 4.25ZM6.03 5.22l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L8.69 10 4.97 6.28a.75.75 0 0 1 1.06-1.06Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* DETAIL & SPEK */}
              <div className="flex-1 flex flex-col justify-between p-4 sm:p-6">
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {product.model}
                  </h3>
                  <p className="text-lg sm:text-xl md:text-2xl text-blue-900 font-semibold mb-4">
                    {product.price}
                  </p>

                  <div className="space-y-3 sm:space-y-4 mb-4">
                    {Object.keys(specs).map((key) => (
                      <div key={key}>
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 capitalize">
                          {key}
                        </p>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {specs[key].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => handleSelectSpec(key, opt)}
                              className={`px-2 sm:px-4 py-1 sm:py-2 border rounded-md text-xs sm:text-sm font-medium transition ${
                                selectedSpec[key] === opt
                                  ? "bg-blue-900 text-white border-blue-900"
                                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-900"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-2">
                      <p className="text-xs sm:text-sm font-medium text-gray-700">
                        Jumlah unit
                      </p>
                      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                        <button
                          onClick={() =>
                            setQuantity((prev) => Math.max(1, prev - 1))
                          }
                          className="px-2 sm:px-3 py-1 text-gray-700 hover:bg-gray-100 transition"
                        >
                          -
                        </button>
                        <span className="px-2 sm:px-4 py-1 text-gray-900">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity((prev) => prev + 1)}
                          className="px-2 sm:px-3 py-1 text-gray-700 hover:bg-gray-100 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {product.desc}
                  </p>
                </div>

                <button className="mt-4 sm:mt-6 w-full bg-blue-900 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 rounded-lg transition">
                  Sewa Sekarang
                </button>
              </div>

              <button
                onClick={onClose}
                className="absolute top-2 sm:top-4 right-2 sm:right-4 text-red-700 hover:text-red-700 text-lg sm:text-xl font-bold"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </DialogPanel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
