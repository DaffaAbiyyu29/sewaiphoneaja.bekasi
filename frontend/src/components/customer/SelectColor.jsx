// src/components/SelectColor.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSwatchbook } from "@fortawesome/free-solid-svg-icons";

/**
 * Komponen untuk memilih varian warna (Color Variant).
 *
 * @param {{
 * variants: Array<object>,
 * selectedVariant: object | null,
 * handleSelectVariant: (variant: object, index: number) => void,
 * }} props
 * @returns {JSX.Element | null}
 */
export default function SelectColor({
  variants,
  selectedVariant,
  handleSelectVariant,
}) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <FontAwesomeIcon
          icon={faSwatchbook}
          className="text-blue-900"
          size="24"
        />
        <h3 className="text-base font-semibold text-gray-900">Pilih Warna</h3>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {variants.map((variant, index) => {
          const isSelected =
            selectedVariant?.variant_unit_code === variant.variant_unit_code;
          const isOutOfStock = variant.qty <= 0;

          return (
            <button
              key={variant.variant_unit_code}
              onClick={() => handleSelectVariant(variant, index)}
              disabled={isOutOfStock}
              className={`px-4 py-3 border-2 rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? "bg-blue-900 text-white border-blue-900 shadow-md scale-105"
                  : isOutOfStock
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-900 hover:shadow-sm"
              }`}
            >
              <div>{variant.color || "Tanpa Warna"}</div>
              {isOutOfStock && (
                <div className="text-xs mt-1 text-red-500 font-semibold">
                  Habis
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
