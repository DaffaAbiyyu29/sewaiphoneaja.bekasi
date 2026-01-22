// src/components/DetailUnitDialog.jsx
"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import ActionButton from "./ActionButton";
import GalleryUnit from "./GaleryUnit";
import ModalWrapper from "./ModalWrapper";
import PriceSummary from "./PriceSummary";
import SelectColor from "./SelectColor";
import SelectPrice from "./SelectPrice";
import SelectQuantity from "./SelectQuantity";
import SelectRentalDate from "./SelectRentalDate";

export default function DetailUnitDialog({ isOpen, onClose, unit }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [activePrices, setActivePrices] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [mainImage, setMainImage] = useState({ id: null, src: "" });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:00");
  const [isLoadingStock, setIsLoadingStock] = useState(false);

  // Reset state saat dialog dibuka dengan unit baru
  useEffect(() => {
    if (unit) {
      setQuantity(1);
      const availableVariants = unit.variants?.filter((v) => v.qty > 0) || [];

      // Default: Jangan langsung pilih variant jika ada banyak, biar user yang milih
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

      const activeP =
        unit.prices?.filter(
          (p) => p.status === "Active" && p.is_delete === 0,
        ) || [];
      setActivePrices(activeP);
      setSelectedPrice(activeP[0] || null);

      setStartDate("");
      setEndDate("");
    }
  }, [unit, isOpen]);

  // LOGIKA: Hitung Tanggal Akhir Minimum
  const calculateMinEndDate = (start) => {
    if (!start || !selectedPrice || selectedPrice.duration === 0) return "";
    const requiredDays = selectedPrice.duration;
    const startDateTime = new Date(`${start}T${startTime}:00`);
    const minEndObj = new Date(startDateTime);
    const msInDay = 1000 * 60 * 60 * 24;
    minEndObj.setTime(startDateTime.getTime() + requiredDays * msInDay - 1);
    return minEndObj.toISOString().split("T")[0];
  };

  const minEndDate = calculateMinEndDate(startDate);

  // Sync End Date jika Start Date berubah
  useEffect(() => {
    if (startDate && selectedPrice) {
      const nextMinEnd = calculateMinEndDate(startDate);
      if (!endDate || new Date(endDate) < new Date(nextMinEnd)) {
        setEndDate(nextMinEnd);
      }
    }
  }, [startDate, selectedPrice]);

  // 🔥 LOGIKA INTI: Refresh Stok dari Backend saat Variant/Tanggal berubah
  useEffect(() => {
    const fetchAvailability = async () => {
      if (selectedVariant && startDate && endDate) {
        setIsLoadingStock(true);
        try {
          const res = await axios.get(
            `${API_URL}/api/unit/catalog/${unit?.unit_code}`,
            {
              params: {
                variant_unit_code: selectedVariant.variant_unit_code,
                start_date: startDate,
                end_date: endDate,
              },
            },
          );

          if (res.data.success) {
            const updatedUnit = res.data.data;
            const matchedVariant = updatedUnit.variants.find(
              (v) => v.variant_unit_code === selectedVariant.variant_unit_code,
            );

            if (matchedVariant) {
              setSelectedVariant(matchedVariant);
              // Jika quantity yang sedang dipilih > stok tersedia sekarang, turunkan ke max stok
              if (quantity > matchedVariant.qty) {
                setQuantity(matchedVariant.qty > 0 ? matchedVariant.qty : 1);
              }
            }
          }
        } catch (err) {
          console.error("Gagal cek ketersediaan stok:", err);
        } finally {
          setIsLoadingStock(false);
        }
      }
    };

    fetchAvailability();
  }, [selectedVariant?.variant_unit_code, startDate, endDate]);

  if (!unit) return null;

  const hasVariants = unit.variants?.length > 0;
  const requiredRentalDays = selectedPrice?.duration || 0;

  // Hitung durasi hari
  const rentalDays = (() => {
    if (!startDate || !endDate) return 0;
    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(`${endDate}T${endTime}:00`);
    if (endDateTime <= startDateTime) return 0;
    const diffTime = endDateTime - startDateTime;
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  })();

  const isDurationValid = (() => {
    if (requiredRentalDays <= 1 || rentalDays === 0) return true;
    return rentalDays % requiredRentalDays === 0;
  })();

  const totalPrice =
    rentalDays * quantity * parseFloat(selectedPrice?.price_per_day || 0);
  const availableStock = selectedVariant ? selectedVariant.qty : 0;

  // Tombol Sewa Disabled jika...
  const isSewaDisabled =
    !selectedPrice ||
    !startDate ||
    !endDate ||
    !selectedVariant ||
    availableStock <= 0 ||
    quantity > availableStock ||
    !isDurationValid ||
    isLoadingStock;

  const handleSelectVariant = (variant, variantIndex) => {
    setSelectedVariant(variant);
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
        <GalleryUnit
          unit={unit}
          selectedVariant={selectedVariant}
          mainImage={mainImage}
          setMainImage={setMainImage}
          API_URL={API_URL}
        />

        <div className="flex-1 flex flex-col">
          <div className="flex-1 space-y-6">
            <SelectPrice
              activePrices={activePrices}
              selectedPrice={selectedPrice}
              setSelectedPrice={setSelectedPrice}
            />

            <SelectColor
              variants={unit.variants}
              selectedVariant={selectedVariant}
              handleSelectVariant={handleSelectVariant}
            />

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

            <div className="relative">
              <SelectQuantity
                unit={unit}
                quantity={quantity}
                setQuantity={setQuantity}
                availableStock={availableStock}
                hasVariants={hasVariants}
                selectedVariant={selectedVariant}
              />
              {isLoadingStock && (
                <span className="text-xs text-blue-600 animate-pulse absolute -bottom-5">
                  Mengecek ketersediaan stok...
                </span>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <PriceSummary
              totalPrice={totalPrice}
              rentalDays={rentalDays}
              quantity={quantity}
              selectedPrice={selectedPrice}
            />

            <ActionButton
              onClick={() => {
                sessionStorage.setItem(
                  "selectedUnit",
                  JSON.stringify({
                    unitCode: unit.unit_code,
                    unitPrice: selectedPrice,
                    unitVariant: selectedVariant,
                    qty: quantity,
                    startDate,
                    startTime,
                    endDate,
                    endTime,
                  }),
                );
                window.location.href = "/rent-form";
              }}
              className="w-full"
              disabled={isSewaDisabled}
            >
              <span className="font-semibold">
                {isLoadingStock
                  ? "Memproses..."
                  : availableStock <= 0 && selectedVariant
                    ? "Stok Habis di Tanggal Ini"
                    : "Sewa Sekarang"}
              </span>
            </ActionButton>

            {isSewaDisabled && !isLoadingStock && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <p className="font-bold mb-1">Peringatan:</p>
                <ul className="list-disc list-inside">
                  {!selectedVariant && (
                    <li>Pilih warna/variant terlebih dahulu</li>
                  )}
                  {selectedVariant && availableStock <= 0 && (
                    <li>
                      Maaf, stok warna ini habis untuk tanggal yang dipilih
                    </li>
                  )}
                  {!startDate && <li>Pilih tanggal sewa</li>}
                  {!isDurationValid && (
                    <li>Durasi harus kelipatan {requiredRentalDays} hari</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
