const nodemailer = require("nodemailer");

// Create email transporter using either SMTP_* env vars or Gmail credentials
function createTransporter() {
  // If SMTP_* variables are provided, prefer them (recommended for production)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = process.env.SMTP_PORT
      ? parseInt(process.env.SMTP_PORT, 10)
      : 587;
    const secure = process.env.SMTP_SECURE === "true" || port === 465;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false",
      },
    });

    // verify transporter in background
    transporter
      .verify()
      .then(() => {
        console.log("SMTP transporter verified");
      })
      .catch((err) => {
        console.warn(
          "SMTP transporter verification failed:",
          err && err.message ? err.message : err
        );
      });

    return transporter;
  }

  // Fallback to Gmail using EMAIL_USER/EMAIL_PASS if explicitly set
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    transporter
      .verify()
      .then(() => {
        console.log("Gmail transporter verified");
      })
      .catch((err) => {
        console.warn(
          "Gmail transporter verification failed:",
          err && err.message ? err.message : err
        );
      });

    return transporter;
  }

  // No email configuration
  console.warn(
    "No SMTP or EMAIL credentials found in env. Email sending will fail until configured."
  );
  return null;
}

// Send email function with simple retry
async function sendEmail(to, subject, text, html = null) {
  const transporter = createTransporter();
  if (!transporter) {
    const err = new Error("No email transporter configured");
    console.error("Email sending failed:", err.message);
    throw err;
  }

  const fromAddress =
    process.env.FROM_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER;

  const mailOptions = {
    from: fromAddress,
    to,
    subject,
    text,
    html,
  };

  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to} (attempt ${attempt})`);
      return;
    } catch (error) {
      console.error(
        `Email send attempt ${attempt} failed:`,
        error && error.message ? error.message : error
      );
      if (attempt === maxAttempts) throw error;
      // small delay before retry
      await new Promise((r) => setTimeout(r, 800));
    }
  }
}

// Send password reset email
async function sendPasswordResetEmail(email, resetToken, req) {
  // Prefer sending users to the frontend reset page. Use FRONTEND_URL env if provided.
  const frontendBase = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.replace(/\/$/, "")
    : null;
  const hostBase = `${req.protocol}://${req.get("host")}`;

  const primaryResetUrl = frontendBase
    ? `${frontendBase}/reset-password/${resetToken}`
    : null;
  const fallbackResetUrl = `${hostBase}/reset-password/${resetToken}`;

  const resetUrlForButton = primaryResetUrl || fallbackResetUrl;

  if (!primaryResetUrl) {
    console.warn(
      "FRONTEND_URL is not set. Emails will use backend host as fallback. Set FRONTEND_URL to point reset links to the frontend app."
    );
  }

  const subject = "Password Reset Request - TransportPro";
  const text = `You requested a password reset. Use the link below to reset your password:\n\n${resetUrlForButton}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>You requested a password reset for your TransportPro account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrlForButton}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      <p style="color: #666; font-size: 14px; margin-top: 20px;">This link will expire in 1 hour.</p>
      <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      <hr />
      <p style="font-size:12px;color:#666">If the button doesn't work, copy & paste the following into your browser:</p>
      <p style="font-size:12px;color:#333;word-break:break-all">${
        primaryResetUrl || fallbackResetUrl
      }</p>
      <p style="font-size:12px;color:#666;margin-top:8px">If your email client opens the login page instead, use this alternative link (it will open login and auto-redirect to the reset page):</p>
      <p style="font-size:12px;color:#333;word-break:break-all">${
        primaryResetUrl ? `${primaryResetUrl}` : fallbackResetUrl
      }?redirectTo=reset&token=${resetToken}</p>
    </div>
  `;

  await sendEmail(email, subject, text, html);
}

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  createTransporter,
};
