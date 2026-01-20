const getStatusBadge = (isInactive) =>
  isInactive ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800";

const formatDate = (value) => {
  if (!value) return "-";
  try {
    const d = new Date(value);
    return d.toLocaleDateString("id-ID");
  } catch (e) {
    return value;
  }
};

const formatCurrency = (value) => {
  if (!value) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export const CustomerColumns = () => [
  {
    header: "Nama",
    accessor: "name",
    sortable: true,
    orderBy: "fullname",
  },
  {
    header: "Email",
    accessor: "email",
    sortable: true,
  },
  {
    header: "No. HP",
    accessor: "phone",
    sortable: true,
  },
  {
    header: "Status",
    accessor: "status",
    render: (row) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
          row.status === "Inactive",
        )}`}
      >
        {row.status || "Active"}
      </span>
    ),
  },
  {
    header: "Total Sewa",
    accessor: "totalRental",
    sortable: true,
  },
  {
    header: "Total Spent",
    accessor: "totalSpent",
    sortable: true,
    render: (row) => (
      <span className="font-semibold">{formatCurrency(row.totalSpent)}</span>
    ),
  },
  {
    header: "Terakhir Sewa",
    accessor: "lastRental",
    sortable: true,
    render: (row) => formatDate(row.lastRental),
  },
];

export default CustomerColumns;
