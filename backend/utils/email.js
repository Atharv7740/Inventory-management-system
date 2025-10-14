const nodemailer = require("nodemailer");

// Email service configurations with fallback support
const EMAIL_CONFIGS = {
  gmail: {
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    secure: true,
    port: 465,
  },
  // Alternative Gmail configuration with different settings
  gmail_alt: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  },
  // Outlook/Hotmail configuration (if user wants to switch)
  outlook: {
    service: "hotmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  },
};

function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error(
      "EMAIL_USER and EMAIL_PASS must be set in environment variables for email sending to work."
    );
    return null;
  }

  // Try Gmail first with enhanced production settings
  const transportConfig = {
    ...EMAIL_CONFIGS.gmail,
    // Production-specific settings for better reliability
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 20000,
    rateLimit: 5,
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 60000, // 60 seconds
    // Additional debugging in production
    debug: process.env.NODE_ENV === "production",
    logger: process.env.NODE_ENV === "production",
  };

  try {
    return nodemailer.createTransporter(transportConfig);
  } catch (error) {
    console.error("Failed to create email transporter:", error.message);
    return null;
  }
}

async function sendEmail(to, subject, text, html = null) {
  const transporter = createTransporter();

  if (!transporter) {
    const errorMsg =
      "Email transporter not available - check environment variables";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const fromAddress = process.env.EMAIL_USER || "no-reply@example.com";
  const mailOptions = {
    from: fromAddress,
    to,
    subject,
    text,
    html,
  };

  try {
    // Verify transporter before sending
    await transporter.verify();
    console.log("SMTP connection verified successfully");

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Email sent successfully to ${to}, MessageID: ${info.messageId}`
    );
    return info;
  } catch (error) {
    const errorMsg = `Email send failed to ${to}: ${
      error && error.message ? error.message : error
    }`;
    console.error(errorMsg);

    // Log more detailed error information
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    if (error.errno) {
      console.error(`Error number: ${error.errno}`);
    }

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
