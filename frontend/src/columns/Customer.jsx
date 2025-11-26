import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { getPage } from "../helpers/GetPage";

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

export const CustomerColumns = (onDeleteClick) => [
  {
    header: "No",
    render: (_, index) => index + 1,
  },
  {
    header: "ID Customer",
    accessor: "customer_id",
    sortable: true,
    render: (row) => (
      <span className="font-mono text-sm">{row.customer_id}</span>
    ),
  },
  {
    header: "Nama Lengkap",
    accessor: "fullname",
    sortable: true,
    render: (row) => row.fullname,
  },
  {
    header: "NIK",
    accessor: "nik",
    sortable: true,
    render: (row) => <span className="font-mono text-sm">{row.nik}</span>,
  },
  {
    header: "Email",
    accessor: "email",
    sortable: true,
    render: (row) => <span className="text-sm">{row.email}</span>,
  },
  {
    header: "Telepon",
    accessor: "telp",
    sortable: true,
    render: (row) => row.telp,
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
        {row.status || "Active"}
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
    render: (row) => (
      <div className="flex gap-2 justify-center items-center">
        <button
          onClick={() => getPage("/menu/customer/" + row.customer_id)}
          className="p-2 bg-blue-900 text-white rounded-md shadow-md hover:bg-blue-800 transition duration-150"
          title="Lihat Detail Customer"
        >
          <FontAwesomeIcon icon={faEye} />
        </button>

        <button
          onClick={() => getPage("/menu/customer/update/" + row.customer_id)}
          className="p-2 bg-yellow-600 text-white rounded-md shadow-md hover:bg-yellow-500 transition duration-150"
          title="Edit Data Customer"
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>

        <button
          onClick={() => onDeleteClick(row.customer_id)}
          className="p-2 bg-red-700 text-white rounded-md shadow-md hover:bg-red-600 transition duration-150"
          title="Hapus Customer"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    ),
  },
];
