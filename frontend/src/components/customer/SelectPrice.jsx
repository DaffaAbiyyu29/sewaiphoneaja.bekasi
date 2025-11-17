// src/components/SelectPrice.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDollar } from "@fortawesome/free-solid-svg-icons";

/**
 * Komponen untuk memilih paket harga (Price Package).
 *
 * @param {{
 * activePrices: Array<object>,
 * selectedPrice: object | null,
 * setSelectedPrice: (price: object) => void,
 * }} props
 * @returns {JSX.Element | null}
 */
export default function SelectPrice({
  activePrices,
  selectedPrice,
  setSelectedPrice,
}) {
  if (activePrices.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <FontAwesomeIcon icon={faDollar} className="text-blue-900" size="24" />
        <h3 className="text-base font-semibold text-gray-900">
          Pilih Paket Harga
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {activePrices.map((price) => {
          const isSelected = selectedPrice?.price_id === price.price_id;
          return (
            <button
              key={price.price_id}
              onClick={() => setSelectedPrice(price)}
              className={`px-4 py-3 border-2 rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? "bg-blue-900 text-white border-blue-900 shadow-md scale-105"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-900 hover:shadow-sm"
              }`}
            >
              <div className="font-bold">{price.duration} Hari</div>
              <div
                className={`text-xs mt-1 ${
                  isSelected ? "text-blue-100" : "text-gray-500"
                }`}
              >
                Rp {parseFloat(price.price_per_day).toLocaleString("id-ID")}
                /hari
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
