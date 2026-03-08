require("dotenv").config();
const nodemailer = require("nodemailer");

let transporter = null;
let mailerMode = "DEV_FALLBACK"; 


function isSmtpConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}


function logSmtpConfig() {
  const hasHost = !!process.env.SMTP_HOST;
  const hasPort = !!process.env.SMTP_PORT;
  const hasUser = !!process.env.SMTP_USER;
  const hasPass = !!process.env.SMTP_PASS;
  const hasFrom = !!process.env.SMTP_FROM;

  if (process.env.NODE_ENV !== "production") {
    console.log("\n📧 SMTP Configuration:");
    console.log(`   SMTP_HOST present: ${hasHost}`);
    console.log(`   SMTP_PORT present: ${hasPort}`);
    console.log(`   SMTP_USER present: ${hasUser}`);
    console.log(`   SMTP_PASS present: ${hasPass}`);
    console.log(`   SMTP_FROM present: ${hasFrom}`);
  } else if (!isSmtpConfigured()) {
    console.warn("📧 Production: SMTP env vars missing (SMTP_HOST, SMTP_USER, SMTP_PASS). OTP emails will not be sent.");
  }
}


function initTransporter() {
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const SMTP_FROM = process.env.SMTP_FROM || "Eventure <no-reply@eventure.com>";

  
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("⚠️  SMTP configuration missing. Email sending disabled. OTP codes will be logged to console.");
    mailerMode = "DEV_FALLBACK";
    return null;
  }

  const secure = process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1";
  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure, 
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    return transporter;
  } catch (error) {
    console.error("❌ Failed to create SMTP transporter:", error.message);
    mailerMode = "DEV_FALLBACK";
    return null;
  }
}


async function verifyTransport() {
  logSmtpConfig();

  if (!transporter) {
    initTransporter();
  }

  if (!transporter) {
    const msg = "SMTP not configured. Password reset emails will not be sent. Set SMTP_HOST, SMTP_USER, SMTP_PASS (and optionally SMTP_FROM) in Render to enable real email.";
    console.warn("⚠️  " + msg);
    if (process.env.NODE_ENV === "production") {
      console.warn("📧 Production: " + msg);
    }
    mailerMode = "DEV_FALLBACK";
    return false;
  }

  try {
    await transporter.verify();
    console.log("✅ SMTP verified");
    mailerMode = "SMTP";
    return true;
  } catch (error) {
    console.error(`❌ SMTP verify failed: ${error.message}`);
    const msg = "Email sending disabled. Set SMTP_HOST, SMTP_USER, SMTP_PASS in Render to enable password reset emails.";
    console.warn("⚠️  " + msg);
    if (/auth|login|535|credentials/i.test(error.message || "")) {
      console.warn("⚠️  If using Brevo: use your SMTP key (SMTP & API → SMTP), not your account password or API key.");
    }
    if (process.env.NODE_ENV === "production") console.warn("📧 Production: " + msg);
    mailerMode = "DEV_FALLBACK";
    return false;
  }
}


async function sendMail({ to, subject, text, html }) {
  const SMTP_FROM = process.env.SMTP_FROM || "Eventure <no-reply@eventure.com>";

  if (mailerMode === "DEV_FALLBACK" || !transporter) {
    if (process.env.NODE_ENV === "production") {
      console.warn(`⚠️ OTP email NOT sent to ${to} (SMTP not configured or verify failed). Set SMTP_HOST, SMTP_USER, SMTP_PASS on the server.`);
    } else {
      console.log("\n📧 [DEV FALLBACK] Email would be sent:");
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Text: ${text}`);
      if (html) console.log(`   HTML: ${html}`);
      console.log("");
    }
    return { ok: true, mode: "fallback" };
  }

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      text,
      html: html || text,
    });
    console.log(`✅ Email sent to ${to} (Message ID: ${info.messageId})`);
    return { ok: true, mode: "smtp", messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    
    if (error.response) {
      console.error("   SMTP Response:", error.response);
    }
    if (error.responseCode) {
      console.error("   Response Code:", error.responseCode);
    }
    if (/auth|login|535|credentials/i.test(error.message || String(error.response || ""))) {
      console.warn("⚠️  If using Brevo: use your SMTP key (SMTP & API → SMTP), not your account password or API key.");
    }
    
    
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n📧 [FALLBACK] Email would be sent to: ${to}`);
      console.log(`   Subject: ${subject}`);
    }
    return { ok: false, mode: "fallback", error: error.message };
  }
}


function getMode() {
  return mailerMode;
}


initTransporter();

module.exports = {
  sendMail,
  verifyTransport,
  getMode,
  isSmtpConfigured,
};