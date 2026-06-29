import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
});

const FROM_NAME = "BiteWise Nutrition";
const FROM_EMAIL = process.env.EMAIL_USER;

const buildMailOptions = (to, subject, text, html) => ({
  from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
  to,
  subject,
  text,
  html,
  headers: {
    "X-Mailer": "BiteWise",
    "List-Unsubscribe": `<mailto:${FROM_EMAIL}?subject=unsubscribe>`,
    "X-Priority": "normal",
  },
});

const textTemplate = (fullName, message) =>
  `Hello ${fullName},\n\n${message}\n\nBest regards,\nThe BiteWise Team`;

export const sendRejectionEmail = async (email, fullName) => {
  try {
    const message = "Thank you for your interest in joining BiteWise as a dieteticien. After reviewing your application, we regret to inform you that your registration request has not been approved at this time. If you believe there was an error or would like to reapply with updated information, please feel free to submit a new request.";
    await transporter.sendMail(buildMailOptions(
      email,
      "Your Dieteticien Application Status",
      textTemplate(fullName, message),
      `<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
        <p>Hello ${fullName},</p>
        <p>Thank you for your interest in joining BiteWise as a dieteticien.</p>
        <p>After reviewing your application, we regret to inform you that your registration request has not been approved at this time.</p>
        <p>If you believe there was an error or would like to reapply with updated information, please feel free to submit a new request.</p>
        <p>Best regards,<br>The BiteWise Team</p>
      </div>`
    ));
    console.log(`Rejection email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send rejection email:", error.message);
  }
};

export const sendApprovalEmail = async (email, fullName) => {
  try {
    const loginUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/login`;
    const message = `Your dieteticien registration request has been approved. You can now log in to your account and start creating nutrition plans, writing blogs, and managing consultations.\n\nLog in here: ${loginUrl}`;
    await transporter.sendMail(buildMailOptions(
      email,
      "Your Dieteticien Account Has Been Approved",
      textTemplate(fullName, message),
      `<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
        <p>Hello ${fullName},</p>
        <p>Your dieteticien registration request has been <strong>approved</strong>.</p>
        <p>You can now log in to your account and start creating nutrition plans, writing blogs, and managing consultations.</p>
        <p style="margin: 28px 0;">
          <a href="${loginUrl}" style="background-color: #2D5A27; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Log In Now</a>
        </p>
        <p>Best regards,<br>The BiteWise Team</p>
      </div>`
    ));
    console.log(`Approval email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send approval email:", error.message);
  }
};