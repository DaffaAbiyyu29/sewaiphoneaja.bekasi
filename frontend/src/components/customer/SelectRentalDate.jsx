// src/components/SelectRentalDate.jsx
import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";

/**
 * Komponen untuk memilih tanggal dan waktu mulai dan selesai sewa.
 * Mendukung validasi kelipatan hari sewa (X, 2X, 3X, dst).
 *
 * @param {{
 * startDate: string,
 * setStartDate: (date: string) => void,
 * endDate: string,
 * setEndDate: (date: string) => void,
 * startTime: string,
 * setStartTime: (time: string) => void,
 * endTime: string,
 * setEndTime: (time: string) => void,
 * rentalDays: number,
 * requiredRentalDays: number, // DURATION DARI PAKET HARGA
 * minEndDate: string, // Tanggal minimum yang harus dipilih
 * isDurationValid: boolean, // Status validasi kelipatan
 * }} props
 * @returns {JSX.Element}
 */
export default function SelectRentalDate({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  rentalDays,
  requiredRentalDays,
  minEndDate,
  isDurationValid,
}) {
  // Efek untuk menyinkronkan waktu selesai dengan waktu mulai (tetap dipertahankan)
  useEffect(() => {
    if (endTime !== startTime) {
      setEndTime(startTime);
    }
  }, [startTime, endTime, setEndTime]);

  // Tentukan apakah ada durasi paket yang mengharuskan kelipatan
  const hasRentalRequirement = requiredRentalDays > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <FontAwesomeIcon
          icon={faCalendar}
          className="text-blue-900"
          size="24"
        />
        <h3 className="text-base font-semibold text-gray-900">
          Tanggal & Waktu Sewa
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* KOLOM KIRI: TANGGAL DAN WAKTU MULAI */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium">
            Mulai Sewa
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all"
            />
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-1/3 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all"
            />
          </div>
        </div>

        {/* KOLOM KANAN: TANGGAL DAN WAKTU SELESAI */}
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-medium flex items-center gap-1">
            Selesai Sewa
            {hasRentalRequirement && (
              <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.5 rounded-full">
                Paket {requiredRentalDays} Hari
              </span>
            )}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Input Tanggal Selesai */}
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              // Menerapkan batas minimum berdasarkan durasi paket
              min={minEndDate}
              className={`flex-1 border rounded-lg px-3 py-2 text-sm transition-all ${
                // Beri highlight merah jika durasi tidak valid
                !isDurationValid && hasRentalRequirement && rentalDays > 0
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
              }`}
            />
            {/* Input Waktu Selesai (Disabled dan sinkron dengan waktu mulai) */}
            <input
              type="time"
              value={startTime}
              disabled
              className="w-1/3 border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Feedback Durasi/Validasi */}
      {hasRentalRequirement && rentalDays > 0 && (
        <div
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            isDurationValid
              ? "bg-blue-50 border border-blue-200 text-blue-900"
              : "bg-red-50 border border-red-200 text-red-900"
          }`}
        >
          {isDurationValid ? (
            <>
              <span className="font-semibold">{rentalDays} hari</span> periode
              sewa
            </>
          ) : (
            <>
              <span className="font-semibold">Perhatian:</span> Durasi harus
              kelipatan dari {requiredRentalDays} hari. Saat ini {rentalDays}{" "}
              hari. (Tanggal yang diizinkan berikutnya: Hari ke{" "}
              {rentalDays +
                (requiredRentalDays - (rentalDays % requiredRentalDays))}
              )
            </>
          )}
        </div>
      )}

      {/* Tampilkan durasi sewa normal jika tidak ada requirement */}
      {!hasRentalRequirement && rentalDays > 0 && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-900">
          <span className="font-semibold">{rentalDays} hari</span> periode sewa
        </div>
      )}
    </div>
  );
}
