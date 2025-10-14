const nodemailer = require("nodemailer");

function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "EMAIL_USER and EMAIL_PASS must be set in .env for email sending to work."
    );
  }
  return nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendEmail(to, subject, text, html = null) {
  const transporter = createTransporter();
  const fromAddress = process.env.EMAIL_USER || "no-reply@example.com";
  const mailOptions = {
    from: fromAddress,
    to,
    subject,
    text,
    html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
    return info;
  } catch (error) {
    console.error(
      `Email send failed:`,
      error && error.message ? error.message : error
    );
    throw error;
  }
}

async function sendPasswordResetEmail(email, resetToken, req) {
  let resetUrlForButton;
  if (process.env.FRONTEND_URL) {
    resetUrlForButton = `${process.env.FRONTEND_URL.replace(
      /\/$/,
      ""
    )}/reset-password/${resetToken}`;
  } else if (req && req.protocol && req.get("host")) {
    resetUrlForButton = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${resetToken}`;
  } else {
    resetUrlForButton = `http://localhost:5173/reset-password/${resetToken}`;
  }
  const subject = "Password Reset Request";
  const text = `You requested a password reset. Use the link below to reset your password:\n\n${resetUrlForButton}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>You requested a password reset for your account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrlForButton}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      <p style="color: #666; font-size: 14px; margin-top: 20px;">This link will expire in 1 hour.</p>
      <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      <hr />
      <p style="font-size:12px;color:#666">If the button doesn't work, copy & paste the following into your browser:</p>
      <p style="font-size:12px;color:#333;word-break:break-all">${resetUrlForButton}</p>
    </div>
  `;
  return await sendEmail(email, subject, text, html);
}

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  createTransporter,
};
