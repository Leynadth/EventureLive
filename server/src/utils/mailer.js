require("dotenv").config();
const nodemailer = require("nodemailer");

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

let transporter = null;
let mailerMode = "DEV_FALLBACK";

function parseSender(fromStr) {
  if (!fromStr || typeof fromStr !== "string") return { name: "Eventure", email: "no-reply@eventure.com" };
  const trimmed = fromStr.trim();
  const match = trimmed.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: "Eventure", email: trimmed };
}

function isSmtpConfigured() {
  return !!(
    process.env.BREVO_API_KEY ||
    (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
  );
}


function logSmtpConfig() {
  const hasBrevoApi = !!process.env.BREVO_API_KEY;
  const hasHost = !!process.env.SMTP_HOST;
  const hasUser = !!process.env.SMTP_USER;
  const hasPass = !!process.env.SMTP_PASS;

  if (process.env.NODE_ENV !== "production") {
    console.log("\n📧 Email configuration:");
    console.log(`   BREVO_API_KEY present: ${hasBrevoApi}`);
    console.log(`   SMTP present: ${hasHost && hasUser && hasPass}`);
  } else if (!isSmtpConfigured()) {
    console.warn("📧 Production: Email not configured.");
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
      connectionTimeout: 20000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
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
  if (process.env.NODE_ENV === "production") {
    console.log(`📧 BREVO_API_KEY: ${process.env.BREVO_API_KEY ? "set" : "not set"}`);
  }

  if (process.env.BREVO_API_KEY) {
    mailerMode = "BREVO_API";
    console.log("✅ Email ready");
    return true;
  }

  if (!transporter) {
    initTransporter();
  }

  if (!transporter) {
    console.warn("⚠️  Email not configured.");
    if (process.env.NODE_ENV === "production") console.warn("📧 Production: Email not configured.");
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
    mailerMode = "DEV_FALLBACK";
    return false;
  }
}

async function sendMailViaBrevoApi({ to, subject, text, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromStr = process.env.SMTP_FROM || "Eventure <no-reply@eventure.com>";
  const sender = parseSender(fromStr);

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: sender.name, email: sender.email },
      to: [{ email: to }],
      subject,
      htmlContent: html || text || "",
      textContent: text || undefined,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    let errMsg = `Brevo API ${res.status}: ${body}`;
    try {
      const j = JSON.parse(body);
      if (j.message) errMsg = j.message;
    } catch (_) {}
    throw new Error(errMsg);
  }

  const data = await res.json().catch(() => ({}));
  return { ok: true, mode: "brevo_api", messageId: data.messageId };
}

async function sendMail({ to, subject, text, html }) {
  const SMTP_FROM = process.env.SMTP_FROM || "Eventure <no-reply@eventure.com>";

  if (mailerMode === "BREVO_API") {
    try {
      const result = await sendMailViaBrevoApi({ to, subject, text, html });
      console.log(`✅ Email sent to ${to}`);
      return result;
    } catch (error) {
      console.error(`❌ Email send failed for ${to}:`, error.message);
      if (/401|unauthorized|invalid.*key/i.test(String(error.message))) {
        console.warn("⚠️  Invalid BREVO_API_KEY.");
      }
      return { ok: false, mode: "fallback", error: error.message };
    }
  }

  if (mailerMode === "DEV_FALLBACK" || !transporter) {
    if (process.env.NODE_ENV === "production") {
      console.warn(`⚠️ OTP email NOT sent to ${to}.`);
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
    if (error.response) console.error("   SMTP Response:", error.response);
    if (error.responseCode) console.error("   Response Code:", error.responseCode);
    if (/auth|login|535|credentials/i.test(error.message || String(error.response || ""))) {
      console.warn("⚠️  SMTP auth failed.");
    }
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n📧 [FALLBACK] Email would be sent to: ${to}, Subject: ${subject}`);
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