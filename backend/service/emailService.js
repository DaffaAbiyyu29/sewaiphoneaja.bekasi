const { default: puppeteer } = require("puppeteer");
const transporter = require("../config/mailer");
const invoiceTemplate = require("../templates/invoiceEmail");
const rejectedInvoiceEmail = require("../templates/rejectedInvoiceEmail");

const sendInvoiceEmail = async (req, res) => {
  try {
    const {
      email,
      name,
      address,
      phone,
      invoice,
      unit,
      variant,
      duration,
      pricePerDay,
      subtotal,
      paid,
      remaining,
      url,
      date,
    } = req.body;

    // basic validation (minimal tapi penting)
    if (!email || !invoice || !name || !unit || !url) {
      return res.status(400).json({
        success: false,
        message: "Data invoice belum lengkap",
      });
    }

    const html = invoiceTemplate({
      email,
      name,
      address,
      phone,
      invoice,
      unit,
      variant,
      duration,
      pricePerDay,
      subtotal,
      paid,
      remaining,
      url,
      date,
    });

    await transporter.sendMail({
      from: `"SewaIphoneAja.Bekasi (No Reply)" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `INVOICE#${invoice}`,
      priority: "high",
      headers: {
        "X-Priority": "1",
        Importance: "high",
      },
      html,
    });

    res.json({
      success: true,
      message: "Email invoice berhasil dikirim",
    });
  } catch (err) {
    console.error("Send invoice error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengirim email",
      error: err.message,
    });
  }
};

const sendRejectedInvoiceEmail = async (req, res) => {
  try {
    const {
      email,
      name,
      phone,
      address,
      invoice,
      unit,
      variant,
      duration,
      pricePerDay,
      subtotal,
      note,
      date,
    } = req.body;

    // validasi minimum sesuai template
    if (!email || !name || !address || !invoice || !unit || !duration) {
      return res.status(400).json({
        success: false,
        message: "Data penolakan belum lengkap",
      });
    }

    const html = rejectedInvoiceEmail({
      invoice,
      date: date || new Date().toLocaleDateString("id-ID"),
      name,
      address,
      email,
      phone,
      unit,
      variant: variant || "-",
      duration,
      pricePerDay: pricePerDay || "-",
      subtotal: subtotal || "-",
      note,
    });

    await transporter.sendMail({
      from: `"SewaIphoneAja.Bekasi (No Reply)" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Pemesanan Ditolak - ${invoice}`,
      priority: "high",
      headers: {
        "X-Priority": "1",
        Importance: "high",
      },
      html,
    });

    return res.json({
      success: true,
      message: "Email penolakan berhasil dikirim",
    });
  } catch (err) {
    console.error("Send rejected invoice error:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal mengirim email penolakan",
      error: err.message,
    });
  }
};

module.exports = {
  sendInvoiceEmail,
  sendRejectedInvoiceEmail,
};
