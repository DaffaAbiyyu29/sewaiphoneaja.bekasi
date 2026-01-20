const fs = require("fs");
const path = require("path");

module.exports = function reportTemplate(data) {
  const logoPath = path.join(process.cwd(), "public/images/sewaiphoneaja.png");
  let logoBase64 = "";
  try {
    logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });
  } catch (e) {
    console.error("Logo not found");
  }

  const hiddenColumns = ["customer_id", "unit_code"];
  const visibleColumns = data.columns.filter(
    (c) => !hiddenColumns.includes(c.toLowerCase()),
  );

  const formatIDR = (val) => "Rp " + new Intl.NumberFormat("id-ID").format(val);

  const formatHeader = (key) => {
    const r = key.replace(/([A-Z])/g, " $1").replace(/_/g, " ");
    return r.charAt(0).toUpperCase() + r.slice(1);
  };

  const tableHeader = visibleColumns
    .map((col) => `<th>${formatHeader(col)}</th>`)
    .join("");

  const tableBody = data.rows
    .map(
      (row, idx) => `
    <tr>
      <td style="text-align:center;color:#64748b;font-weight:500;">
        ${idx + 1}
      </td>
      ${visibleColumns
        .map((col) => {
          let value = row[col] ?? "-";
          let align = "left";
          const name = col.toLowerCase();

          const isRupiahColumn =
            ["total", "revenue", "spent", "price", "pendapatan"].some((k) =>
              name.includes(k),
            ) && name !== "totaltransaksi";

          if (isRupiahColumn && typeof value === "number") {
            value = formatIDR(value);
            align = "right";
          } else if (
            typeof value === "number" ||
            name.includes("status") ||
            name.includes("date")
          ) {
            align = "center";
          }

          return `<td style="text-align:${align}">${value}</td>`;
        })
        .join("")}
    </tr>
  `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>
  @page { 
    size: A4; 
    margin: 15mm 10mm; /* Margin standar untuk printer */
  }
  
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; }

  body {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    background: #fff;
  }

  /* Kunci utama: Gunakan table layout untuk header yang berulang */
  .report-container {
    width: 100%;
  }

  /* Header fixed di setiap halaman */
  .header-spacer { height: 180px; } /* Ruang kosong untuk header */
  
  .page-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 180px;
    background: #fff;
    border-bottom: 2px solid #f1f5f9;
    z-index: 1000;
  }

  .content-wrapper {
    width: 100%;
  }

  table { width: 100%; border-collapse: collapse; }

  .report-title {
    margin: 0;
    color: #1e3a8a;
    font-size: 35px;
    font-weight: 800;
    text-align: right;
  }

  /* Table Header yang akan berulang */
  .items-table thead {
    display: table-header-group; /* WAJIB: Membuat header muncul di tiap halaman */
  }

  .items-table th {
    background: #f8fafc !important;
    border-bottom: 2px solid #e2e8f0;
    padding: 12px 10px;
    font-size: 10px;
    text-transform: uppercase;
    font-weight: 700;
    text-align: left;
  }

  .items-table td {
    padding: 10px;
    font-size: 11px;
    border-bottom: 1px solid #f1f5f9;
  }

  /* Mencegah baris terpotong di tengah halaman */
  tr { page-break-inside: avoid; }

  /* Memberi jarak bawah agar tabel tidak mepet ke ujung kertas */
  .items-table {
    margin-bottom: 40px;
  }

  .footer-note {
    page-break-inside: avoid;
    margin-top: 20px;
    padding: 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    text-align: center;
    font-size: 11px;
    color: #64748b;
  }
</style>
</head>

<body>

  <div class="page-header">
    <div style="padding-bottom: 20px 0;">
      <table width="100%">
        <tr>
        <td width="60%" style="vertical-align: top;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align: middle;">
                  <img
                    src="data:image/png;base64,${logoBase64}"
                    width="60"
                    height="60"
                    style="display: block;"
                  />
                </td>
                <td style="vertical-align: middle;">
                  <div style="font-size: 20px; font-weight: 700; color: #0c4a6e; line-height: 1.2;">SewaIphoneAja.Bekasi</div>
                  <div style="font-size: 13px; color: #6b7280;">Penyewaan iPhone Bekasi</div>
                </td>
              </tr>
            </table>
            <div style="margin-top: 20px; font-size: 12px; color: #9ca3af; line-height: 1.6;">
              Bekasi Utara, Kec. Babelan, Ujung Harapan,<br>
              Gang Assalam 1, RT 004/042, No 50<br>
              <strong style="color: #64748b;">+62 851-7419-4500</strong>
            </div>
          </td>
          
          <td width="40%" style="text-align:right; vertical-align:top;">
            <h1 class="report-title">REPORT</h1>
            <div style="font-size:12px;color:#64748b; margin-top: 10px;">Kategori: <strong>${data.title}</strong></div>
            <div style="font-size:12px;color:#64748b;">Periode: <strong>${data.period}</strong></div>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <div class="content-wrapper">
    <div class="header-spacer"></div>

    <table class="items-table">
      <thead>
        <tr>
          <th width="5%" style="text-align:center;">NO</th>
          ${tableHeader}
        </tr>
      </thead>
      <tbody>
        ${tableBody}
      </tbody>
    </table>

    <div class="footer-note">
      Dokumen laporan ini sah dan dicetak otomatis oleh sistem SewaIphoneAja.<br/>
      Waktu Cetak: <strong>${new Date().toLocaleString("id-ID")}</strong>
    </div>
  </div>

</body>
</html>
`;
};
