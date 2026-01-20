export const renderRevenueReport = (rows) => {
  if (!rows.length) {
    return `<p>Tidak ada data.</p>`;
  }

  const header = `
    <table>
      <thead>
        <tr>
          <th>Tanggal</th>
          <th>Invoice</th>
          <th>Customer</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
  `;

  const body = rows
    .map(
      (r) => `
      <tr>
        <td>${r.date}</td>
        <td>${r.invoice}</td>
        <td>${r.customer}</td>
        <td style="text-align:right">
          Rp ${Number(r.total).toLocaleString("id-ID")}
        </td>
      </tr>
    `,
    )
    .join("");

  return header + body + "</tbody></table>";
};
