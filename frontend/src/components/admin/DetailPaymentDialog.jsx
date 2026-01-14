// src/components/DetailPaymentDialog.jsx
"use client";

import {
  faCalendar,
  faFileImage,
  faHome,
  faMoneyBillWave,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate, formatTime } from "../../helpers/Format";
import { getUserInfo } from "../../helpers/GetUserInfo";
import ModalWrapper from "../ModalWrapper";

export default function DetailPaymentDialog({
  isOpen,
  onClose,
  payment,
  customer,
  onSuccess,
}) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [status, setStatus] = useState("");
  const [totalPayment, setTotalPayment] = useState(0);
  const [errorPayment, setErrorPayment] = useState("");

  // Reset state when payment changes
  useEffect(() => {
    if (payment) {
      setStatus(payment.status || "Unpaid");
      setTotalPayment(payment.total_payment || 0);
    }
  }, [payment]);

  if (!payment) return null;

  const isPaid = payment.status === "Paid";

  const handleSave = async () => {
    const user = getUserInfo();

    if (totalPayment <= 0) {
      setErrorPayment("Total pembayaran harus lebih dari 0");
      return;
    }

    setErrorPayment(""); // bersihin error sebelum submit

    const form = new FormData();
    form.append("updated_by", user.user_id);
    form.append("rent_id", payment.rent_id);
    form.append("total_payment", totalPayment);
    form.append("status", status);

    await axios.put(`${API_URL}/api/payment/${payment.payment_id}`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <>
      <ModalWrapper
        isOpen={isOpen}
        onClose={onClose}
        title="Detail Pembayaran"
        maxWidth="max-w-4xl"
      >
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-5">
            {/* HEADER - Compact */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faReceipt}
                    className="w-4 h-4 text-white"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment ID</p>
                  <p className="text-base font-bold text-gray-900">
                    {payment.payment_id}
                  </p>
                </div>
              </div>

              {/* Edit Status */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isPaid}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold border cursor-pointer transition-colors
                ${
                  isPaid
                    ? "opacity-60 cursor-not-allowed bg-green-100 text-green-700 border-green-300"
                    : ""
                }
                ${
                  !isPaid && status === "Unpaid"
                    ? "bg-red-100 text-red-800 border-red-100 hover:bg-red-200"
                    : ""
                }
                ${
                  !isPaid && status === "Paid"
                    ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                    : ""
                }
              `}
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            {/* MAIN CONTENT - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* LEFT COLUMN */}
              <div className="space-y-4">
                {/* RENTAL INFO */}
                {payment.rent_id && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faHome}
                        className="w-3.5 h-3.5 text-blue-600"
                      />
                      <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                        Rental ID
                      </p>
                    </div>
                    <p className="text-sm font-bold text-blue-900 mt-1 ml-5">
                      {payment.rent_id}
                    </p>
                  </div>
                )}

                {/* TOTAL PEMBAYARAN EDITABLE */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
                    Total Pembayaran
                  </p>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faMoneyBillWave}
                      className="w-6 h-6 text-green-600 flex-shrink-0"
                    />
                    <input
                      type="number"
                      value={totalPayment}
                      onChange={(e) => setTotalPayment(e.target.value)}
                      disabled={isPaid}
                      className={`text-2xl font-bold text-green-700 bg-transparent outline-none w-full
                      ${isPaid ? "opacity-60 cursor-not-allowed" : ""}`}
                    />
                  </div>

                  <p className="text-xs text-green-600 mt-1 ml-8">
                    {formatCurrency(totalPayment)}
                  </p>

                  {/* ERROR MESSAGE */}
                  {errorPayment && (
                    <p className="text-xs text-red-600 font-medium mt-1 ml-8">
                      {errorPayment}
                    </p>
                  )}
                </div>

                {/* DATE INFORMATION */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Payment Date */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded bg-blue-100 flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faCalendar}
                          className="w-3 h-3 text-blue-600"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Tanggal Bayar</p>
                    </div>
                    {payment.payment_date ? (
                      <>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(payment.payment_date)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatTime(payment.payment_date)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        Belum bayar
                      </p>
                    )}
                  </div>

                  {/* Due Date */}
                  {/* <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded bg-amber-100 flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="w-3 h-3 text-amber-600"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Jatuh Tempo</p>
                    </div>
                    {payment.due_date ? (
                      <>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(payment.due_date)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatTime(payment.due_date)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 italic">-</p>
                    )}
                  </div> */}
                </div>

                {/* METADATA - Compact */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500 mb-0.5">Dibuat</p>
                      <p className="font-medium text-gray-700">
                        {customer || "-"}
                      </p>
                      {payment.created_at && (
                        <p className="text-gray-500 text-[10px]">
                          {formatDate(payment.created_at)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-500 mb-0.5">Diperbarui</p>
                      <p className="font-medium text-gray-700">
                        {payment.updated_by || "-"}
                      </p>
                      {payment.updated_at && (
                        <p className="text-gray-500 text-[10px]">
                          {formatDate(payment.updated_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - PROOF IMAGE */}
              <div className="space-y-4">
                {payment.proof_of_payment ? (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <FontAwesomeIcon
                        icon={faFileImage}
                        className="w-4 h-4 text-gray-600"
                      />
                      <p className="text-sm font-semibold text-gray-700">
                        Bukti Pembayaran
                      </p>
                    </div>

                    <div className="flex-1 flex items-center justify-center bg-white rounded-lg border border-gray-300 overflow-hidden">
                      <img
                        src={`${API_URL}/get-image/${payment.proof_of_payment}`}
                        alt="Bukti Pembayaran"
                        className="max-h-[400px] w-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() =>
                          window.open(
                            `${API_URL}/get-image/${payment.proof_of_payment}`,
                            "_blank"
                          )
                        }
                      />
                    </div>

                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Klik gambar untuk memperbesar
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 h-full flex flex-col items-center justify-center">
                    <FontAwesomeIcon
                      icon={faFileImage}
                      className="w-12 h-12 text-gray-300 mb-2"
                    />
                    <p className="text-sm text-gray-400">
                      Tidak ada bukti pembayaran
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                Tutup
              </button>
              {!isPaid && (
                <button
                  onClick={handleSave}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Simpan
                </button>
              )}
            </div>
          </div>
        </div>
      </ModalWrapper>
    </>
  );
}
