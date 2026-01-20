const formatCurrency = (value) => {
  if (!value) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export const RevenueColumns = () => [
  {
    header: "Periode",
    accessor: "periode",
    sortable: true,
    orderBy: "payment_date",
  },
  {
    header: "Total Transaksi",
    accessor: "totalTransaksi",
    sortable: true,
    render: (row) => row.totalTransaksi || 0,
  },
  {
    header: "Total Pendapatan",
    accessor: "totalPendapatan",
    sortable: true,
    render: (row) => (
      <span className="font-semibold">
        {formatCurrency(row.totalPendapatan)}
      </span>
    ),
  },
  {
    header: "Lunas",
    accessor: "lunas",
    render: (row) => <span className="text-green-600">{row.lunas || 0}</span>,
  },
  {
    header: "Pending",
    accessor: "pending",
    render: (row) => (
      <span className="text-orange-600">{row.pending || 0}</span>
    ),
  },
];
