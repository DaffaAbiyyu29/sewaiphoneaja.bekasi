module.exports = function rejectionTemplate(data) {
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
    </head>
    <body
      style="
        margin:0;
        padding:0;
        background:#f4f6f8;
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                    Roboto,Helvetica,Arial,sans-serif;
      "
    >
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
        <tr>
          <td align="center">
            <table width="650" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">

              <!-- Header dengan Logo dan REJECTION NOTICE -->
              <tr>
                <td style="padding:40px 40px 20px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <!-- KIRI: LOGO + BRAND -->
                      <td width="50%" style="vertical-align:top;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <!-- LOGO -->
                            <td style="vertical-align:middle;">
                              <img
                                src="https://drive.google.com/uc?export=view&id=1jCW0IFdPbolqs-5vtCNzBF5Pb8sjd6hL"
                                width="40"
                                height="40"
                                alt="Sewa iPhone Aja"
                                style="display:block;"
                              />
                            </td>

                            <!-- BRAND -->
                            <td style="padding-left:12px;vertical-align:middle;">
                              <div style="font-size:14px;font-weight:bold;color:#0c4a6e;line-height:1.2;">
                                SewaIphoneAja.Bekasi
                              </div>
                              <div style="font-size:12px;color:#6b7280;">
                                Penyewaan iPhone Bekasi
                              </div>
                            </td>
                          </tr>

                          <!-- ALAMAT -->
                          <tr>
                            <td></td>
                            <td style="padding-left:12px;padding-top:4px;">
                              <div style="font-size:11px;color:#9ca3af;line-height:1.4;">
                                Bekasi Utara, Kec. Babelan, Ujung Harapan, Gang Assalam 1, RT 004/042, No 50
                              </div>

                              <div style="font-size:11px;line-height:1.4;">
                                <a
                                  href="https://maps.app.goo.gl/T6A3fDdUNEnJj9Ka6"
                                  target="_blank"
                                  style="color:#2563eb;text-decoration:none;"
                                >
                                  Lihat lokasi di Google Maps
                                </a>
                              </div>

                              <div style="font-size:11px;color:#9ca3af;line-height:1.4;">
                                +62 851-7419-4500
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>

                      <!-- KANAN: REJECTION NOTICE -->
                      <td width="50%" style="text-align:right;vertical-align:top;">
                        <h1 style="margin:0;color:#dc2626;font-size:32px;font-weight:bold;">
                          PENOLAKAN
                        </h1>

                        <table cellpadding="0" cellspacing="0" style="margin-left:auto;margin-top:6px;">
                          <tr>
                            <td
                              style="text-align:right;padding:4px 8px 4px 0;color:#64748b;font-size:13px;"
                            >
                              No. Pemesanan
                            </td>
                            <td
                              style="text-align:left;padding:4px 0;font-weight:bold;font-size:13px;"
                            >
                              ${data.invoice || "N/A"}
                            </td>
                          </tr>
                          <tr>
                            <td
                              style="text-align:right;padding:4px 8px 4px 0;color:#64748b;font-size:13px;"
                            >
                              Tanggal
                            </td>
                            <td
                              style="text-align:left;padding:4px 0;font-weight:bold;font-size:13px;"
                            >
                              ${
                                data.date ||
                                new Date().toLocaleDateString("id-ID")
                              }
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Detail Item / Pemesanan -->
              <tr>
                <td style="padding:20px 40px;">
                  <table width="100%" cellpadding="12" cellspacing="0" style="border-collapse:collapse;">
                    <thead>
                      <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
                        <th style="text-align:left;padding:12px 8px;font-size:13px;color:#475569;">No.</th>
                        <th style="text-align:left;padding:12px 8px;font-size:13px;color:#475569;">Produk</th>
                        <th style="text-align:center;padding:12px 8px;font-size:13px;color:#475569;">Durasi</th>
                        <th style="text-align:right;padding:12px 8px;font-size:13px;color:#475569;">Harga/Hari</th>
                        <th style="text-align:right;padding:12px 8px;font-size:13px;color:#475569;">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style="border-bottom:1px solid #e2e8f0;">
                        <td style="padding:16px 8px;font-size:14px;">1</td>
                        <td style="padding:16px 8px;">
                          <div style="font-size:14px;font-weight:600;color:#1e293b;">${
                            data.unit
                          }</div>
                          <div style="font-size:12px;color:#64748b;margin-top:2px;">${
                            data.variant || "Blue"
                          }</div>
                        </td>
                        <td style="text-align:center;padding:16px 8px;font-size:14px;">${
                          data.duration
                        } Hari</td>
                        <td style="text-align:right;padding:16px 8px;font-size:14px;">${
                          data.pricePerDay
                        }</td>
                        <td style="text-align:right;padding:16px 8px;font-size:14px;font-weight:600;">${
                          data.subtotal || data.total
                        }</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- Informasi Customer -->
              <tr>
                <td style="padding:0 40px 20px 40px;">
                  <h3 style="margin:0 0 12px 0;font-size:15px;color:#1e293b;font-weight:600;">Informasi Pemesan</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:16px;border-radius:6px;">
                    <tr>
                      <td>
                        <p style="margin:0;font-size:14px;color:#1e293b;font-weight:600;">${
                          data.name
                        }</p>
                        <p style="margin:4px 0;font-size:13px;color:#64748b;">${
                          data.address
                        }</p>
                        <p style="margin:4px 0;font-size:13px;color:#64748b;">Telp: ${
                          data.phone
                        }</p>
                        <p style="margin:4px 0;font-size:13px;color:#64748b;">Email: ${
                          data.email
                        }</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Status Badge -->
              <tr>
                <td style="padding:0 40px 20px 40px;">
                  <div style="background:#fee2e2;color:#991b1b;padding:12px 20px;border-radius:6px;text-align:center;font-weight:600;font-size:14px;border-left:4px solid #dc2626;">
                    Status: PEMESANAN DITOLAK
                  </div>
                </td>
              </tr>

              <!-- Alasan Penolakan -->
              <tr>
                <td style="padding:0 40px 30px 40px;">
                  <div style="background:#f8fafc;padding:20px;border-radius:6px;border-left:4px solid #1e3a8a;">
                    <h4 style="margin:0 0 10px 0;font-size:14px;color:#1e293b;font-weight:600;">Note</h4>
                    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
                      ${data.note || "Unit tidak tersedia."}
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Langkah Selanjutnya -->
              <tr>
                <td style="padding:0 40px 30px 40px;">
                  <div style="background:#eff6ff;padding:20px;border-radius:6px;">
                    <h4 style="margin:0 0 10px 0;font-size:14px;color:#1e293b;font-weight:600;">Langkah Selanjutnya</h4>
                    <p style="margin:0 0 12px 0;font-size:13px;color:#64748b;line-height:1.6;">
                        Silakan hubungi admin untuk mendapatkan informasi mengenai ketersediaan unit atau jadwal lain yang tersedia.
                    </p>

                    <div style="margin-top:16px;text-align:center;">
                      <a
                        href="https://wa.me/6285174194500"
                        target="_blank"
                        style="
                          display:inline-block;
                          background:#22c55e;
                          color:#ffffff;
                          text-decoration:none;
                          padding:12px 24px;
                          border-radius:6px;
                          font-size:14px;
                          font-weight:600;
                        "
                      >
                        Hubungi Admin via WhatsApp
                      </a>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:12px;color:#64748b;text-align:center;line-height:1.6;">
                    Terima kasih atas perhatian Anda.<br>
                    Untuk informasi lebih lanjut, silakan hubungi kami di +62 851-7419-4500
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};
