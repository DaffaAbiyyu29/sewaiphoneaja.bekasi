const transporter = require("../config/mailer");
const invoiceTemplate = require("../templates/invoiceEmail");

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
      total,
      paid,
      remaining,
      status,
      message,
      url,
      date,
    } = req.body;

    // basic validation (minimal tapi penting)
    if (!email || !invoice || !name || !unit || !total || !status || !url) {
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
      total,
      paid,
      remaining,
      status,
      message,
      url,
      date,
    });

    await transporter.sendMail({
      from: `"Admin Sewa iPhone" <${process.env.EMAIL_USER}>`,
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

module.exports = { sendInvoiceEmail };
