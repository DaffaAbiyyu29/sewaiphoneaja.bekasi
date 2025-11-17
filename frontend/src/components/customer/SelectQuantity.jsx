// src/components/SelectQuantity.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxesPacking } from "@fortawesome/free-solid-svg-icons";

/**
 * Komponen untuk memilih jumlah unit sewa.
 *
 * @param {{
 * quantity: number,
 * setQuantity: (callback: (prev: number) => number) => void,
 * availableStock: number,
 * hasVariants: boolean,
 * selectedVariant: object | null,
 * }} props
 * @returns {JSX.Element}
 */
export default function SelectQuantity({
  unit,
  quantity,
  setQuantity,
  availableStock,
  hasVariants,
  selectedVariant,
}) {
  const isIncrementDisabled =
    quantity >= availableStock || (hasVariants && !selectedVariant);

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={faBoxesPacking}
              className="text-blue-900"
              size="24"
            />
            <h3 className="text-base font-semibold text-gray-900">
              Jumlah Unit
            </h3>
          </div>
          <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              disabled={quantity <= 1}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              −
            </button>
            <span className="px-6 py-2 text-gray-900 font-bold min-w-[60px] text-center bg-white border-x border-gray-300">
              {quantity}
            </span>
            <button
              onClick={() =>
                setQuantity((prev) => Math.min(prev + 1, availableStock))
              }
              disabled={isIncrementDisabled}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-gray-600">
            {hasVariants && !selectedVariant
              ? "Pilih warna untuk melihat stok"
              : `Stok tersedia: ${availableStock} unit`}
          </span>
        </div>
      </div>

      {/* Description */}
      {unit.description && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Deskripsi
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {unit.description}
          </p>
        </div>
      )}
    </>
  );
}
