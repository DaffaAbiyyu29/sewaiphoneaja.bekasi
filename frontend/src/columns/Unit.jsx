import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { getPage } from "../helpers/GetPage";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

export const UnitColumns = (onDeleteClick) => [
  {
    header: "No",
    render: (_, index) => index + 1,
  },
  {
    header: "Kode Unit",
    accessor: "unit_code",
    sortable: true,
  },
  {
    header: "Nama Unit",
    accessor: "unit_name",
    sortable: true,
  },
  {
    header: "Brand",
    accessor: "brand",
    sortable: true,
  },
  {
    header: "Deskripsi",
    accessor: "description",
  },
  {
    header: "Status",
    accessor: "status",
    sortable: true,
  },
  {
    header: "Foto",
    accessor: "photo",
    sortable: true,
    render: (row) => (
      <div className="flex justify-center items-center">
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
        {/* Tombol View */}
        <button
          onClick={() => getPage("/menu/unit/" + row.unit_code)}
          className="p-2 bg-blue-900 text-white rounded-md shadow-md hover:bg-blue-800 transition duration-150"
          title="Lihat Detail Unit"
        >
          <FontAwesomeIcon icon={faEye} />
        </button>

        {/* Tombol Edit */}
        <button
          onClick={() => getPage("/menu/unit/update/" + row.unit_code)}
          className="p-2 bg-yellow-600 text-white rounded-md shadow-md hover:bg-yellow-500 transition duration-150"
          title="Edit Data Unit"
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>

        {/* Tombol Delete */}
        <button
          onClick={() => onDeleteClick(row.unit_code)} // ⬅️ panggil fungsi dari index.jsx
          className="p-2 bg-red-700 text-white rounded-md shadow-md hover:bg-red-600 transition duration-150"
          title="Hapus Unit"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    ),
  },
];
