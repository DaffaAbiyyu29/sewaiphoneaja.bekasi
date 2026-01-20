module.exports = function invoiceTemplate(data) {
  const fs = require("fs");
  const imageBase64 = fs.readFileSync("./public/images/sewaiphoneaja.png", {
    encoding: "base64",
  });

  // tentukan warna dan pesan sesuai status
  let statusBg = "#fffbeb"; // default kuning muda
  let statusBorder = "#f59e0b"; // default border kuning tua
  let statusText = "Menunggu Pembayaran";
  let statusMsg =
    "Harap selesaikan pembayaran sebelum atau saat pengambilan unit.";

  switch (data.status?.toLowerCase()) {
    case "cancelled":
      statusBg = "#fee2e2"; // merah muda
      statusBorder = "#dc2626"; // merah tua
      statusText = "Dibatalkan";
      statusMsg =
        "Invoice ini telah dibatalkan dan tidak memerlukan tindakan lebih lanjut.";
      break;
    case "waiting payment":
      statusBg = "#fffbeb"; // kuning muda
      statusBorder = "#f59e0b"; // kuning tua
      statusText = "Menunggu Pembayaran";
      statusMsg =
        "Mohon melakukan pembayaran sesuai dengan ketentuan yang berlaku sebelum proses pengambilan unit.";
      break;
    case "open":
      statusBg = "#e0f2fe"; // biru muda
      statusBorder = "#3b82f6"; // biru tua
      statusText = "Open";
      statusMsg =
        "Invoice ini masih aktif dan sedang dalam proses. Tindak lanjut akan dilakukan sesuai dengan ketentuan yang berlaku.";
      break;
    case "close":
      statusBg = "#dcfce7"; // hijau muda
      statusBorder = "#16a34a"; // hijau tua
      statusText = "Close";
      statusMsg =
        "Invoice ini telah diselesaikan sepenuhnya dan proses terkait telah dinyatakan selesai.";
      break;
  }

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>
        /* Hilangkan semua margin printer */
        @page {
          size: A4;
          margin: 0;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
        }
        /* Body harus putih dan mengisi 100% area A4 tanpa sisa */
        html, body {
          margin: 0;
          padding: 0;
          width: 210mm;
          min-height: 297mm;
          background: #ffffff; /* Ubah ke putih total */
          font-family: 'Poppins', sans-serif;
        }
        /* Container utama mentok ke pinggir */
        .invoice-main {
          width: 100%;
          padding: 40px; /* Padding dalam agar konten tidak nempel garis potong kertas */
          background: #ffffff;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        .text-right {
          text-align: right;
        }
        .invoice-title {
          margin: 0;
          color: #1e3a8a;
          font-size: 50px;
          font-weight: 800;
          line-height: 0.8;
          letter-spacing: -2px;
        }
        .header-info-table {
          margin-top: 15px;
          margin-left: auto;
          width: auto;
        }
        .header-info-table td {
          padding: 2px 0;
          font-size: 14px;
        }
        .items-table {
          margin-top: 40px;
        }
        .items-table th {
          background: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
          padding: 12px 8px;
          font-size: 12px;
          color: #475569;
          text-transform: uppercase;
        }
        .items-table td {
          padding: 10px 8px;
          border-bottom: 1px solid #f1f5f9;
        }
        .summary-section {
          margin-top: 15px; /* Diperkecil dari 40px agar mepet ke tabel atas */
          width: 100%;
        }
      </style>
    </head>
    <body>
      <div class="invoice-main">
        <table width="100%">
          <tr>
            <td width="60%" style="vertical-align: top;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <img
                      src="data:image/png;base64,${imageBase64}"
                      width="60"
                      height="60"
                      style="display: block;"
                    />
                  </td>
                  <td style="vertical-align: middle;">
                    <div style="font-size: 20px; font-weight: 800; color: #0c4a6e; line-height: 1.2;">SewaIphoneAja.Bekasi</div>
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

            <td width="40%" class="text-right" style="vertical-align: top;">
              <h1 class="invoice-title">INVOICE</h1>
              <table class="header-info-table">
                <tr>
                  <td style="color: #64748b; padding-right: 15px;">No. Invoice:</td>
                  <td style="font-weight: 700; color: #1e293b; text-align: right;">${
                    data.invoice
                  }</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding-right: 15px;">Tanggal:</td>
                  <td style="font-weight: 700; color: #1e293b; text-align: right;">${
                    data.date
                  }</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <table class="items-table">
          <thead>
            <tr>
              <th width="5%" style="text-align: left;">NO</th>
              <th width="45%" style="text-align: left;">PRODUK</th>
              <th width="15%" style="text-align: center;">DURASI</th>
              <th width="15%" style="text-align: right;">HARGA</th>
              <th width="20%" style="text-align: right;">SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${data.detailsRows}
          </tbody>
        </table>

          <table class="summary-section">
          <tr>
            <td width="55%" style="vertical-align: top;">
              <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Tagihan Kepada:</div>
              <div style="font-size: 15px; color: #1e293b; font-weight: 600;">${
                data.name
              }</div>
              <div style="font-size: 13px; color: #64748b; margin-top: 5px; line-height: 1.5; max-width: 280px;">
                ${data.address}<br>
                Telp: ${data.phone}<br>
                Email: ${data.email}
              </div>
            </td>
            <td width="45%" style="vertical-align: top;">
              <table width="100%" style="border-collapse:collapse;">
                <tr>
                  <td style="text-align:right;font-size:16px;font-weight:700;color:#1e3a8a;padding:4px 0;">
                    TOTAL
                  </td>
                  <td style="width:30px;text-align:center;font-size:16px;font-weight:700;color:#16a34a;">
                    
                  </td>
                  <td style="text-align:right;font-size:20px;font-weight:800;color:#1e3a8a;padding:4px 0;">
                    ${data.subtotal}
                  </td>
                </tr>

                ${
                  data.paid || data.status?.toLowerCase() !== "cancelled"
                    ? `
                    <tr>
                      <td style="text-align:right;font-size:14px;font-weight:600;color:#1e293b;padding-top:6px;">
                        Pembayaran Diterima
                      </td>
                      <td style="text-align:center;font-size:14px;font-weight:700;color:#16a34a;">
                        
                      </td>
                      <td style="text-align:right;font-size:14px;font-weight:700;color:#16a34a;padding-top:6px;">
                        ${data.paid || "0"}
                      </td>
                    </tr>

                    <tr>
                      <td style="text-align:right;font-size:14px;font-weight:600;color:#1e293b;padding-top:4px;">
                        Sisa Tagihan
                      </td>
                      <td style="text-align:center;font-size:14px;font-weight:700;color:#dc2626;">
                        
                      </td>
                      <td style="text-align:right;font-size:14px;font-weight:800;color:#dc2626;padding-top:4px;">
                        ${data.remaining}
                      </td>
                    </tr>
                    `
                    : ""
                }
              </table>
            </td>
          </tr>
        </table>

        <div style="margin-top: 50px;">
          <div style="background: ${statusBg}; border-left: 5px solid ${statusBorder}; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
            <div style="color: ${statusBorder}; font-weight: 800; font-size: 15px; text-transform: uppercase;">Status: ${statusText}</div>
            <div style="color: ${statusBorder}; font-size: 13px; margin-top: 4px;">${statusMsg}</div>
          </div>

          <div style="background: #f8fafc; padding: 25px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <div style="font-size: 14px; font-weight: 700; color: #1e3a8a; margin-bottom: 10px;">Informasi Rekening Pembayaran:</div>
            <table width="100%" style="font-size: 14px; color: #1e293b;">
              <tr>
                <td width="120" style="color: #64748b;">Bank</td>
                <td>: <strong>BCA</strong></td>
              </tr>
              <tr>
                <td style="color: #64748b;">No. Rekening</td>
                <td>: <strong>5211077655</strong></td>
              </tr>
              <tr>
                <td style="color: #64748b;">Atas Nama</td>
                <td>: <strong>FIKA FITRIANESIA</strong></td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
};
