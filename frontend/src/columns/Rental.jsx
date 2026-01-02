import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { getPage } from "../helpers/GetPage";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (value) => {
  if (!value) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const getStatusBadgeColor = (status) => {
  const lower = status.toLowerCase();

  if (lower.includes("waiting")) {
    return "bg-yellow-100 text-yellow-800";
  }

  switch (status) {
    case "Open":
      return "bg-blue-100 text-blue-800";
    case "Close":
      return "bg-green-100 text-green-800";
    case "Waiting Approval":
      return "bg-yellow-100 text-yellow-800";
    case "Waiting Payment":
      return "bg-yellow-100 text-yellow-800";
    case "OverDue":
      return "bg-red-100 text-red-800";
    case "Rejected Approval":
      return "bg-red-100 text-red-800";
    case "Invalid":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const RentalColumns = () => [
  {
    header: "No",
    render: (_, index) => index + 1,
  },
  {
    header: "Nama Customer",
    accessor: "customer_id",
    sortable: true,
    render: (row) => row.customer_name,
  },
  {
    header: "Invoice Number",
    accessor: "invoice_number",
    sortable: true,
    render: (row) => row.invoice_number,
  },
  {
    header: "Tanggal Mulai",
    accessor: "start_rent_date",
    sortable: true,
    render: (row) => formatDate(row.start_rent_date),
  },
  {
    header: "Tanggal Selesai",
    accessor: "end_rent_date",
    sortable: true,
    render: (row) => formatDate(row.end_rent_date),
  },
  {
    header: "Total Harga",
    accessor: "total_price",
    sortable: true,
    render: (row) => formatCurrency(row.total_price),
  },
  {
    header: "Total Bayar",
    accessor: "total_paid",
    sortable: true,
    render: (row) => formatCurrency(row.total_paid),
  },
  {
    header: "Sisa Bayar",
    accessor: "balance",
    sortable: true,
    render: (row) => formatCurrency(row.balance),
  },
  {
    header: "Status",
    accessor: "status",
    sortable: true,
    render: (row) => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
          row.status
        )}`}
      >
        {row.status}
      </span>
    ),
  },
  {
    header: "Aksi",
    render: (row) => (
      <div className="flex gap-2 justify-center items-center">
        {/* Tombol View */}
        <button
          onClick={() => getPage("/menu/rental/" + row.rent_id)}
          className="p-2 bg-blue-900 text-white rounded-md shadow-md hover:bg-blue-800 transition duration-150"
          title="Lihat Detail Rental"
        >
          <FontAwesomeIcon icon={faEye} />
        </button>

        {/* Tombol Edit */}
        {/* <button
          onClick={() => getPage("/menu/rental/update/" + row.rent_id)}
          className="p-2 bg-yellow-600 text-white rounded-md shadow-md hover:bg-yellow-500 transition duration-150"
          title="Edit Data Rental"
        >
          <FontAwesomeIcon icon={faEdit} />
        </button> */}

        {/* Tombol Delete */}
        {/* <button
          onClick={() => onDeleteClick(row.rent_id)}
          className="p-2 bg-red-700 text-white rounded-md shadow-md hover:bg-red-600 transition duration-150"
          title="Hapus Rental"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button> */}
      </div>
    ),
  },
];
