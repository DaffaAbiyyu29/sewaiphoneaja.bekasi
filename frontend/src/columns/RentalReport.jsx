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
  const lower = status?.toLowerCase();

  if (lower.includes("waiting")) {
    return "bg-yellow-100 text-yellow-800";
  }

  switch (status) {
    case "Open":
      return "bg-blue-100 text-blue-800";
    case "Close":
      return "bg-green-100 text-green-800";
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

export const RentalColumns = () => [
  {
    header: "Invoice Number",
    accessor: "invoiceNumber",
    sortable: true,
    orderBy: "invoice_number",
    render: (row) => (
      <Link
        to={`/menu/rental/${row.rentId}`}
        className="text-blue-600 font-semibold hover:underline hover:text-blue-700"
      >
        {row.invoiceNumber}
      </Link>
    ),
  },
  {
    header: "Customer",
    accessor: "customer",
    sortable: true,
    orderBy: "customer_id",
  },
  {
    header: "Unit",
    accessor: "unit",
  },
  {
    header: "Periode",
    accessor: "periode",
    sortable: false,
  },
  {
    header: "Status",
    accessor: "status",
    sortable: true,
    orderBy: "status",
    render: (row) => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
          row.status,
        )}`}
      >
        {row.status}
      </span>
    ),
  },
  {
    header: "Total",
    accessor: "total",
    sortable: true,
    orderBy: "total_price",
    render: (row) => (
      <span className="font-semibold">{formatCurrency(row.total)}</span>
    ),
  },
];
