import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { getPage } from "../helpers/GetPage";

export const VariantColumns = [
  { header: "No", render: (_, index) => index + 1 },
  //   { header: "Kode Variant", accessor: "variant_unit_code", sortable: true },
  //   { header: "Kode Unit", accessor: "unit_code" },
  { header: "Warna", accessor: "color" },
  { header: "Qty", accessor: "qty" },
  { header: "Status", accessor: "status" },
  {
    header: "Tanggal Dibuat",
    accessor: "created_at",
    render: (row) =>
      new Date(row.created_at).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
  },
  {
    header: "Aksi",
    render: (row) => (
      <div className="flex gap-2 justify-center items-center">
        {/* Tombol View */}
        <button
          onClick={() => getPage("/menu/unit/" + row.unit_code)}
          className="p-2 bg-blue-900 text-white rounded-md shadow-md hover:bg-blue-800 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-opacity-50"
          title="Lihat Detail Unit"
        >
          <FontAwesomeIcon icon={faEye} />
        </button>

        {/* Tombol Edit */}
        <button
          onClick={() => console.log("Edit", row.unit_code)}
          className="p-2 bg-yellow-600 text-white rounded-md shadow-md hover:bg-yellow-500 transition duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50"
          title="Edit Data Unit"
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>

        {/* Tombol Delete */}
        <button
          onClick={() => console.log("Delete", row.unit_code)}
          className="p-2 bg-red-700 text-white rounded-md shadow-md hover:bg-red-600 transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-opacity-50"
          title="Hapus Unit"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    ),
  },
];
