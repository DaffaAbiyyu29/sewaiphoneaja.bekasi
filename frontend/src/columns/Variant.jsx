import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { getPage } from "../helpers/GetPage";

const API_URL = import.meta.env.VITE_API_URL;

export const VariantColumns = (onDeleteClick) => [
  { header: "No", render: (_, index) => index + 1 },
  //   { header: "Kode Variant", accessor: "variant_unit_code", sortable: true },
  //   { header: "Kode Unit", accessor: "unit_code" },
  { header: "Warna", accessor: "color" },
  { header: "Qty", accessor: "qty" },
  { header: "Status", accessor: "status" },
  {
    header: "Foto",
    accessor: "photo",
    sortable: true,
    render: (row) => (
      <div className="flex justify-center items-center">
        {" "}
        {row.photo ? (
          <img
            src={`${API_URL}/get-image/${row.photo}`}
            alt={row.unit_name}
            className="max-w-20 max-h-20 object-cover min-w-20 min-h-20"
          />
        ) : (
          <div
            className="w-full h-full border-2 border-dashed border-gray-200 rounded-lg 
                     flex items-center justify-center text-gray-500 text-xs 
                     max-w-20 max-h-20 min-w-20 min-h-20"
          >
            Tidak Ada Foto
          </div>
        )}
      </div>
    ),
  },
  {
    header: "Aksi",
    render: (row) => (
      <div className="flex gap-2 justify-center items-center">
        {/* Tombol Edit */}
        <button
          onClick={() =>
            getPage(`/menu/unit/variant/update/${row.variant_unit_code}`)
          }
          className="p-2 bg-yellow-600 text-white rounded-md shadow-md hover:bg-yellow-500 transition duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50"
          title="Edit Data Variant Unit"
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>

        {/* Tombol Delete */}
        <button
          onClick={() => onDeleteClick(row.variant_unit_code)}
          className="p-2 bg-red-700 text-white rounded-md shadow-md hover:bg-red-600 transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-opacity-50"
          title="Hapus Variant Unit"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    ),
  },
];
