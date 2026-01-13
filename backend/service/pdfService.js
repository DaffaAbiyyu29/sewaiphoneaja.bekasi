const { default: puppeteer } = require("puppeteer");
const invoiceTemplate = require("../templates/invoicePDF");
const TrnRent = require("../models/TrnRental");
const TrnPayment = require("../models/TrnPayment");
const TrnDetailRent = require("../models/TrnDetailRental");
const MstCustomer = require("../models/MstCustomer");
const MstUnit = require("../models/MstUnit");
const MstVariantUnit = require("../models/MstVariantUnit");

const exportInvoicePdfByNumber = async (req, res) => {
  try {
    const { invoice_number } = req.params;
    if (!invoice_number)
      return res
        .status(400)
        .json({ success: false, message: "Invoice number wajib diisi" });

    const rent = await TrnRent.findOne({
      where: { invoice_number },
      include: [
        { model: MstCustomer, as: "customer" },
        {
          model: TrnDetailRent,
          as: "details",
          include: [
            { model: MstUnit, as: "unit" },
            { model: MstVariantUnit, as: "variant" },
          ],
        },
      ],
    });

    if (!rent)
      return res
        .status(404)
        .json({ success: false, message: "Invoice tidak ditemukan" });

    const payments = await TrnPayment.findAll({
      where: { rent_id: rent.rent_id, is_delete: false },
    });

    const totalPaid = payments.reduce(
      (sum, p) => sum + parseFloat(p.total_payment || 0),
      0
    );
    const remaining = rent.total_price - totalPaid;

    const detailsRows = rent.details
      .map((d, idx) => {
        const unitName = d.unit?.unit_name || "-";
        const variantColor = d.variant?.color || "-";
        const duration = d.qty || 1;
        const pricePerDay = d.price
          ? `Rp ${Number(d.price).toLocaleString("id-ID")}`
          : "-";
        const subtotal = d.subtotal
          ? `Rp ${Number(d.subtotal).toLocaleString("id-ID")}`
          : "-";

        return `
        <tr>
          <td style="text-align: left;">${idx + 1}</td>
          <td>
            <div style="font-weight: 700; color: #1e293b;">${unitName}</div>
            <div style="font-size: 11px; color: #94a3b8;">${variantColor}</div>
          </td>
          <td style="text-align: center;">${duration} Hari</td>
          <td style="text-align: right;">${pricePerDay}</td>
          <td style="text-align: right; font-weight: 700; color: #1e293b;">${subtotal}</td>
        </tr>
      `;
      })
      .join("");

    const html = invoiceTemplate({
      invoice: rent.invoice_number,
      date: rent.start_rent_date
        ? new Date(rent.start_rent_date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : new Date().toLocaleDateString("id-ID"),
      name: rent.customer?.fullname || "-",
      email: rent.customer?.email || "-",
      phone: rent.customer?.telp || "-",
      address: rent.customer?.address || "-",
      subtotal: `Rp ${Number(rent.total_price).toLocaleString("id-ID")}`,
      paid:
        totalPaid > 0
          ? `Rp ${Number(totalPaid).toLocaleString("id-ID")}`
          : null,
      remaining: `Rp ${Number(remaining).toLocaleString("id-ID")}`,
      status: rent.status,
      detailsRows,
    });

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // SANGAT PENTING: Viewport harus pas A4
    await page.setViewport({ width: 794, height: 1123 });

    await page.setContent(html, {
      waitUntil: ["networkidle0", "domcontentloaded", "load"],
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 }, // Margin nol agar Full Putih
      preferCSSPageSize: true,
    });

    await browser.close();

    const safeInvoiceNumber = invoice_number.replace(/[^a-zA-Z0-9-_]/g, "");

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=INVOICE-${safeInvoiceNumber}.pdf`,
      "Content-Length": pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Export PDF error:", err);
    res
      .status(500)
      .json({ success: false, message: "Gagal export PDF invoice" });
  }
};

module.exports = { exportInvoicePdfByNumber };
