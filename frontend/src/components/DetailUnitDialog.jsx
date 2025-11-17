// src/components/DetailUnitDialog.jsx
"use client";

import { useEffect, useState } from "react";
import ModalWrapper from "../components/ModalWrapper";
import ActionButton from "../components/ActionButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SelectPrice from "./customer/SelectPrice";
import SelectColor from "./customer/SelectColor";
import SelectRentalDate from "./customer/SelectRentalDate";
import SelectQuantity from "./customer/SelectQuantity";
import GalleryUnit from "./customer/GaleryUnit";
import PriceSummary from "./customer/PriceSummary";

export default function DetailUnitDialog({ isOpen, onClose, unit }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [mainImage, setMainImage] = useState({ id: null, src: "" });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:00");

  useEffect(() => {
    if (unit) {
      setQuantity(1);
      const availableVariants = unit.variants?.filter((v) => v.qty > 0) || [];
      if (availableVariants.length === 1) {
        setSelectedVariant(availableVariants[0]);
        setMainImage({
          id: `variant-0`,
          src: availableVariants[0].photo || null,
        });
      } else {
        setSelectedVariant(null);
        setMainImage({ id: "unit-photo", src: unit.photo || null });
      }

      setSelectedPrice(null);
      setStartDate("");
      setEndDate("");
      setStartTime("09:00");
      setEndTime("09:00");
    }
  }, [unit]);

  // LOGIKA: Sinkronisasi/Paksa endDate agar tidak kurang dari durasi paket
  useEffect(() => {
    if (startDate && selectedPrice) {
      const newMinEndDate = calculateMinEndDate(startDate);
      if (!endDate || new Date(endDate) < new Date(newMinEndDate)) {
        setEndDate(newMinEndDate);
      }
    } else {
      setEndDate("");
    }
  }, [startDate, selectedPrice]);

  if (!unit) return null;

  const activePrices = unit.prices?.filter((p) => p.status === "Active") || [];
  const hasVariants = unit.variants?.length > 0;
  const requiredRentalDays = selectedPrice?.duration || 0;

  // LOGIKA: Hitung Tanggal Akhir Minimum (Contoh: 15 + 3 hari = 18)
  const calculateMinEndDate = (start) => {
    if (!start || requiredRentalDays === 0) return "";

    const startDateTime = new Date(`${start}T${startTime}:00`);
    const minEndObj = new Date(startDateTime);

    const msInDay = 1000 * 60 * 60 * 24;
    const minimumDurationMs = requiredRentalDays * msInDay;

    // Atur waktu akhir minimum. Kurangi 1ms agar Math.ceil() menghasilkan requiredRentalDays
    minEndObj.setTime(startDateTime.getTime() + minimumDurationMs - 1);

    return minEndObj.toISOString().split("T")[0];
  };

  const minEndDate = calculateMinEndDate(startDate);

  const rentalDays = (() => {
    if (!startDate || !endDate || !startTime || !endTime) return 0;

    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(`${endDate}T${endTime}:00`);

    if (endDateTime.getTime() <= startDateTime.getTime()) return 0;

    const diffTime = endDateTime.getTime() - startDateTime.getTime();
    const msInDay = 1000 * 60 * 60 * 24;

    return Math.max(1, Math.ceil(diffTime / msInDay));
  })();

  // LOGIKA: VALIDASI KELIPATAN HARI (3, 6, 9, dst.)
  const isDurationValid = (() => {
    if (requiredRentalDays <= 1 || rentalDays === 0) return true;
    if (rentalDays < requiredRentalDays) return false;
    return rentalDays % requiredRentalDays === 0;
  })();
  // END LOGIKA VALIDASI KELIPATAN HARI

  const calculateTotal = () => {
    if (!selectedPrice || !startDate || !endDate || !startTime || !endTime)
      return 0;

    const finalDays = rentalDays;

    return finalDays * quantity * parseFloat(selectedPrice.price_per_day);
  };

  const availableStock = hasVariants
    ? selectedVariant
      ? selectedVariant.qty
      : 0
    : unit.qty || 0;

  const totalPrice = calculateTotal();

  // Tombol Sewa Disabled jika:
  const isSewaDisabled =
    !selectedPrice ||
    !startDate ||
    !endDate ||
    quantity <= 0 ||
    (hasVariants && !selectedVariant) ||
    !isDurationValid;

  const handleSelectVariant = (variant, variantIndex) => {
    setSelectedVariant(variant);
    setQuantity((prevQty) => Math.max(1, Math.min(prevQty, variant.qty)));
    setMainImage({ id: `variant-${variantIndex}`, src: variant.photo || null });
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={unit.unit_name}
      maxWidth="max-w-[1600px]"
    >
      <div className="flex flex-col lg:flex-row gap-8 max-h-[80vh] overflow-y-auto p-2">
        {/* LEFT: Gallery Section */}
        <GalleryUnit
          unit={unit}
          selectedVariant={selectedVariant}
          mainImage={mainImage}
          setMainImage={setMainImage}
          API_URL={API_URL}
        />

        {/* RIGHT: Details Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 space-y-6">
            {/* Price Package Selection */}
            <SelectPrice
              activePrices={activePrices}
              selectedPrice={selectedPrice}
              setSelectedPrice={setSelectedPrice}
            />

            {/* Variant Color Selection */}
            <SelectColor
              variants={unit.variants}
              selectedVariant={selectedVariant}
              handleSelectVariant={handleSelectVariant}
            />

            {/* Rental Date Selection */}
            <SelectRentalDate
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              rentalDays={rentalDays}
              requiredRentalDays={requiredRentalDays}
              minEndDate={minEndDate}
              isDurationValid={isDurationValid}
            />

            {/* Quantity Selection */}
            <SelectQuantity
              unit={unit}
              quantity={quantity}
              setQuantity={setQuantity}
              availableStock={availableStock}
              hasVariants={hasVariants}
              selectedVariant={selectedVariant}
            />
          </div>

          {/* Price Summary & Action Button */}
          <div className="mt-6 space-y-4">
            {/* Total Price Display */}
            <PriceSummary
              totalPrice={totalPrice}
              rentalDays={rentalDays}
              quantity={quantity}
              selectedPrice={selectedPrice}
            />

            {/* Action Button */}
            <ActionButton
              onClick={() => {
                onClose();
                sessionStorage.setItem(
                  "selectedUnit",
                  JSON.stringify({
                    unitCode: unit.unit_code,
                    unitPrice: selectedPrice,
                    unitVariant: selectedVariant,
                    qty: quantity,
                    startDate: startDate,
                    startTime: startTime,
                    endDate: endDate,
                    endTime: endTime,
                  })
                );
                window.location.href = "/rent-form";
              }}
              className="w-full"
              disabled={isSewaDisabled}
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="font-semibold">
                  {isSewaDisabled ? "Lengkapi Data Sewa" : "Sewa Sekarang"}
                </span>
              </div>
            </ActionButton>

            {/* Validation Messages */}
            {isSewaDisabled && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <div className="flex gap-2">
                  <svg
                    className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Mohon lengkapi:</p>
                    <ul className="list-disc list-inside space-y-1 text-amber-700">
                      {!selectedPrice && <li>Pilih paket harga</li>}
                      {hasVariants && !selectedVariant && (
                        <li>Pilih warna unit</li>
                      )}
                      {!startDate && <li>Pilih tanggal mulai sewa</li>}
                      {!endDate && <li>Pilih tanggal selesai sewa</li>}
                      {/* Pesan Validasi Kelipatan Hari */}
                      {!isDurationValid && requiredRentalDays > 1 && (
                        <li>
                          Durasi sewa harus kelipatan dari {requiredRentalDays}{" "}
                          hari
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
