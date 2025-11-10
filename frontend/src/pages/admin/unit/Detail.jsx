import { useParams, useNavigate } from "react-router-dom";
import Datatable from "../../../components/Datatable";
import { VariantColumns } from "../../../columns/Variant";
import { PriceColumns } from "../../../columns/Price";
import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../../../helpers/GetToken";
import { Loader } from "../../../components/Loader";

export default function DetailUnitPage() {
  const { unitCode } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [unitData, setUnitData] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/units/${unitCode}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      .then((res) => setUnitData(res.data.data))
      .catch((err) => console.error(err));
  }, [API_URL, unitCode]);

  if (!unitData)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        {/* Memeriksa autentikasi... */}
      </div>
    );

  return (
    <div className="p-6 space-y-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {unitData.unit_name}
        </h1>
        <button
          onClick={() => navigate("/menu/unit")}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
        >
          Kembali
        </button>
      </div>

      {/* Foto + Detail + Harga */}
      <div className="bg-white shadow rounded-lg p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom 1: Foto Unit */}
        <div className="flex justify-center items-start">
          {unitData.photo ? (
            <img
              src={`${API_URL}/uploads/${unitData.photo}`}
              alt={unitData.unit_name}
              className="w-full max-w-sm rounded-lg shadow-md object-cover"
            />
          ) : (
            <div className="w-full max-w-sm h-70 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400">
              Tidak ada foto
            </div>
          )}
        </div>

        {/* Kolom 2: Detail Unit */}
        <div className="flex flex-col justify-between">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Informasi Unit
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500">Kode Unit</p>
              <p className="font-semibold text-gray-800">
                {unitData.unit_code}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500">Nama Unit</p>
              <p className="font-semibold text-gray-800">
                {unitData.unit_name}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500">Brand</p>
              <p className="font-semibold text-gray-800">{unitData.brand}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500">Status</p>
              <span
                className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                  unitData.status === "Available"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {unitData.status}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 sm:col-span-2">
              <p className="text-xs text-gray-500">Deskripsi</p>
              <p className="text-gray-800">{unitData.description || "-"}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 sm:col-span-2">
              <p className="text-xs text-gray-500">Tanggal Dibuat</p>
              <p className="text-gray-800">
                {new Date(unitData.created_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Kolom 3: Tabel Harga */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Daftar Harga</h2>
          <Datatable
            apiUrl={`${API_URL}/api/units/price/${unitCode}`}
            columns={PriceColumns}
            isSearch={true}
            isCard={false}
          />
        </div>
      </div>

      {/* Daftar Variant */}
      <div>
        <h2 className="text-xl font-semibold mb-3 mt-7">Daftar Variant</h2>
        <Datatable
          apiUrl={`${API_URL}/api/units/variant/${unitCode}`}
          columns={VariantColumns}
          isSearch={true}
        />
      </div>
    </div>
  );
}
