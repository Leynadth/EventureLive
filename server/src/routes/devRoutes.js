const express = require("express");
const { sendMail, getMode } = require("../utils/mailer");

const router = express.Router();


router.get("/dev/test-email", async (req, res) => {
  
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ ok: false, error: "Not found" });
  }

  const { to } = req.query;

  if (!to) {
    return res.status(400).json({ ok: false, error: "Query parameter 'to' is required" });
  }

  try {
    console.log(`\n🧪 [TEST] Attempting to send test email to: ${to}`);
    const result = await sendMail({
      to,
      subject: "Test email",
      text: "Test email received.",
    });

    if (result.ok) {
      return res.status(200).json({
        ok: true,
        mode: result.mode,
        message: result.mode === "smtp" || result.mode === "brevo_api"
          ? "Email sent successfully"
          : "Email logged to console (not configured or failed)",
      });
    } else {
      return res.status(500).json({
        ok: false,
        mode: result.mode || getMode(),
        error: result.error || "Failed to send email",
      });
    }
  } catch (error) {
    console.error("❌ Test email error:", error);
    return res.status(500).json({
      ok: false,
      mode: getMode(),
      error: error.message,
    });
  }
});

module.exports = router;