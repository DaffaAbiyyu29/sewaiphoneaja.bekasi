const formatCurrency = (value) => {
  if (value === null || value === undefined) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export const UnitColumns = () => [
  // {
  //   header: "Kode Unit",
  //   accessor: "unitCode",
  //   sortable: true,
  //   orderBy: "unit_code",
  // },
  {
    header: "Nama Unit",
    accessor: "unitName",
    sortable: true,
    orderBy: "unit_name",
  },
  { header: "Brand", accessor: "brand", sortable: true },
  {
    header: "Harga / Hari",
    accessor: "pricePerDay",
    render: (row) => (
      <span className="font-semibold">{formatCurrency(row.pricePerDay)}</span>
    ),
  },
  {
    header: "Varian",
    accessor: "totalVariants",
    render: (row) => <span>{row.totalVariants} warna</span>,
  },
  {
    header: "Tersedia",
    accessor: "totalVariants",
    render: (row) => <span>{row.totalAvailable} unit</span>,
  },
  {
    header: "Total Sewa",
    accessor: "totalVariants",
    render: (row) => <span>{row.totalRental} unit</span>,
  },
  {
    header: "Pendapatan",
    accessor: "revenue",
    render: (row) => (
      <span className="font-semibold">{formatCurrency(row.revenue)}</span>
    ),
  },
  // { header: "Utilisasi", accessor: "utilization", sortable: true },
];

export default UnitColumns;
