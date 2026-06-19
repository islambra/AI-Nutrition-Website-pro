import User from "../models/User.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { securityLogger } from "../middleware/securityLogger.js";

const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      securityLogger.passwordReset(email, getClientIp(req), false);
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent."
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 3600000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    try {
      // Try to send email, silently fail if email not configured
      const nodemailer = (await import('nodemailer')).default;
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"BiteWise Nutrition" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset Request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2D5A27;">Password Reset</h2>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <p style="margin-top: 24px;">
              <a href="${resetUrl}"
                 style="background-color: #2D5A27; color: white; padding: 12px 24px;
                        text-decoration: none; border-radius: 8px; display: inline-block;">
                Reset Password
              </a>
            </p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `,
      });
    } catch (_) {
      // In development, return the reset URL directly
      if (process.env.NODE_ENV !== 'production') {
        return res.status(200).json({
          success: true,
          message: "Password reset link (dev mode)",
          resetUrl
        });
      }
    }

    securityLogger.passwordReset(email, getClientIp(req), true);
    res.status(200).json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent."
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error processing request" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token is invalid or has expired. Please request a new password reset."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    securityLogger.passwordReset(user.email, getClientIp(req), true);
    res.status(200).json({
      success: true,
      message: "Password has been reset successfully. You can now log in with your new password."
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error resetting password" });
  }
};
