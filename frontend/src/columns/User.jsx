import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { getPage } from "../helpers/GetPage";
import { Switch } from "@headlessui/react";
import Avatar from "../components/Avatar";

const API_URL = import.meta.env.VITE_API_URL;

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusBadgeColor = (status) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Inactive":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const UserColumns = (onDeleteClick) => [
  {
    header: "No",
    render: (_, index) => index + 1,
  },
  {
    header: "NIK",
    accessor: "nik",
    sortable: true,
    render: (row) => <span className="font-mono text-sm">{row.nik}</span>,
  },
  {
    header: "Nama",
    accessor: "name",
    sortable: true,
    render: (row) => row.name,
  },
  {
    header: "Photo",
    render: (row) => {
      return <Avatar image={row.profile_picture} name={row.name} size={10} />;
    },
  },
  {
    header: "Email",
    accessor: "email",
    sortable: true,
    render: (row) => row.email,
  },
  {
    header: "Telepon",
    accessor: "telp",
    sortable: true,
    render: (row) => row.telp,
  },
  {
    header: "Alamat",
    accessor: "address",
    render: (row) => row.address || "-",
  },
  {
    header: "Gender",
    accessor: "gender",
    render: (row) => (row.gender === "M" ? "Laki-laki" : "Perempuan"),
  },
  {
    header: "TTL",
    render: (row) => `${row.birth_place || "-"}, ${formatDate(row.birth_date)}`,
  },
  {
    header: "Status",
    accessor: "status",
    sortable: true,
    render: (row) => (
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
          row.status
        )}`}
      >
        {row.status}
      </span>
    ),
  },
  {
    header: "Tanggal Daftar",
    accessor: "created_at",
    sortable: true,
    render: (row) => formatDate(row.created_at),
  },
  {
    header: "Aksi",
    render: (row) => {
      return (
        <div className="flex gap-2 justify-center items-center">
          <button
            onClick={() => getPage("/menu/user/" + row.nik)}
            className="p-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
            title="Lihat Detail"
          >
            <FontAwesomeIcon icon={faEye} />
          </button>

          {/* Tombol Edit */}
          <button
            onClick={() => getPage("/menu/user/update/" + row.nik)}
            className="p-2 bg-yellow-600 text-white rounded-md shadow-md hover:bg-yellow-500 transition duration-150"
            title="Edit Data Unit"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>

          {/* Tombol Delete */}
          <button
            onClick={() => onDeleteClick(row.nik)} // ⬅️ panggil fungsi dari index.jsx
            className="p-2 bg-red-700 text-white rounded-md shadow-md hover:bg-red-600 transition duration-150"
            title="Hapus Unit"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      );
    },
  },
];
