import { Link } from "react-router-dom";

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
      return "bg-yellow-100 text-yellow-800";
    case "Waiting Payment":
      return "bg-yellow-100 text-yellow-800";
    case "OverDue":
      return "bg-red-100 text-red-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    case "Invalid":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const RecentRentalColumns = () => [
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
    render: (row) => (
      <Link
        to={`/menu/rental/${row.rent_id}`}
        className="text-blue-600 font-semibold hover:underline hover:text-blue-700"
      >
        {row.invoice_number}
      </Link>
    ),
  },
  {
    header: "Device",
    accessor: "device_name",
    sortable: true,
    render: (row) => row.device_name,
  },
  {
    header: "Duration (days)",
    accessor: "duration",
    sortable: true,
    render: (row) => row.duration,
  },
  {
    header: "Total Harga",
    accessor: "total_price",
    sortable: true,
    render: (row) => formatCurrency(row.total_price),
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
];
