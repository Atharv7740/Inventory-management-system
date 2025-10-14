const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetEmail, createTransporter } = require("../utils/email");

// User login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        error:
          "Account is temporarily locked due to too many failed login attempts. Please try again later.",
      });
    }

    // Check if account is active
    if (user.status !== "active") {
      return res.status(401).json({
        error: "Account is inactive. Please contact administrator.",
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts
      await user.incLoginAttempts();
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    // Reset login attempts and update last login
    await user.updateLastLogin();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return user data (password excluded by toJSON method)
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        department: user.department,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      error: "Server error during login.",
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // As requested, reveal that we attempted to send a reset link to the supplied email
      // NOTE: This leaks information about registered emails; ensure this is desired.
      console.warn(`Password reset requested for non-existing email: ${email}`);
      return res.json({
        success: true,
        data: {
          message: `Password reset link sent to ${email}. If this address is registered, you will receive an email shortly.`,
        },
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email and wait for result so frontend sees immediate failure if email fails
    try {
      const info = await sendPasswordResetEmail(email, resetToken, req);
      console.log(
        `Password reset email send info for ${email}:`,
        info && info.messageId ? info.messageId : info
      );
      if (info && info.messageId) {
        try {
          const nodemailer = require("nodemailer");
          const preview = nodemailer.getTestMessageUrl(info);
          if (preview) console.log(`Preview URL: ${preview}`);
        } catch (e) {}
      }
      return res.json({
        success: true,
        data: {
          message: `Password reset link sent to ${email}. Please check your inbox.`,
        },
      });
    } catch (emailError) {
      console.error(
        "Failed to send password reset email:",
        emailError && emailError.message ? emailError.message : emailError
      );
      // Keep the token on the user record to allow admins to inspect/resend. But report failure.
      const publicMsg =
        "Failed to send password reset email. Please contact the administrator or try again later.";
      return res
        .status(500)
        .json({
          success: false,
          message: publicMsg,
          error: (emailError && emailError.message) || String(emailError),
        });
    }
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during password reset request.",
    });
  }
};

// Reset password (supports token in params or in body)
const resetPassword = async (req, res) => {
  try {
    // token may come from params (when user visits link) or from body (frontend posts token)
    const token = req.params.token || req.body.token;
    const password = req.body.password || req.body.newPassword;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Reset token is required." });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token.",
      });
    }

    // Update password
    user.password = password; // Will be hashed by pre-save middleware
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      data: {
        message:
          "Password reset successful. You can now login with your new password.",
      },
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error during password reset." });
  }
};

// Redirect GET token link to frontend reset page (backwards compatibility)
const redirectResetToFrontend = async (req, res) => {
  try {
    const { token } = req.params;
    const frontendBase = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.replace(/\/$/, "")
      : null;
    const hostBase = `${req.protocol}://${req.get("host")}`;
    const base = frontendBase || hostBase;
    const redirectUrl = `${base}/reset-password/${token}`;
    return res.redirect(302, redirectUrl);
  } catch (err) {
    console.error("Redirect error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to redirect to reset page." });
  }
};

// Validate reset token (API) - returns JSON whether token is valid
const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token)
      return res
        .status(400)
        .json({ success: false, message: "Token is required." });

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token." });
    }

    return res.json({
      success: true,
      data: { valid: true, email: user.email },
    });
  } catch (err) {
    console.error("Validate token error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error validating token." });
  }
};

// Dev-only helper: verify email transporter configuration (only allowed outside production)
const getEmailTransporterStatus = async (req, res) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      return res.json({
        success: false,
        data: { ok: false, message: "No transporter configured" },
      });
    }
    try {
      await transporter.verify();
      return res.json({
        success: true,
        data: { ok: true, message: "Transporter verified" },
      });
    } catch (err) {
      return res.json({
        success: false,
        data: {
          ok: false,
          message: err && err.message ? err.message : String(err),
        },
      });
    }
  } catch (err) {
    console.error("getEmailTransporterStatus error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching transporter status.",
    });
  }
};

// Dev-only helper: return the latest reset token for an email (only allowed outside production)
const getResetTokenForEmail = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Query parameter `email` is required.",
      });
    }
    const user = await User.findOne({ email });
    if (!user || !user.passwordResetToken) {
      return res.status(404).json({
        success: false,
        message: "No reset token found for that email.",
      });
    }
    return res.json({
      success: true,
      data: {
        email: user.email,
        token: user.passwordResetToken,
        expires: user.passwordResetExpires,
      },
    });
  } catch (err) {
    console.error("getResetTokenForEmail error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error fetching reset token." });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({
      error: "Server error while fetching profile.",
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, department } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    // Update allowed fields
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (department) user.department = department;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({
      error: "Server error while updating profile.",
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters long.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        error: "Current password is incorrect.",
      });
    }

    // Update password
    user.password = newPassword; // Will be hashed by pre-save middleware
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({
      error: "Server error while changing password.",
    });
  }
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
  redirectResetToFrontend,
  validateResetToken,
  getEmailTransporterStatus,
  getResetTokenForEmail,
  getProfile,
  updateProfile,
  changePassword,
};
