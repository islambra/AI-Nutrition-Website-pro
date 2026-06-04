import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendApprovalEmail = async (email, fullName) => {
  try {
    await transporter.sendMail({
      from: `"BiteWise Nutrition" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Dieteticien Account Has Been Approved",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2D5A27;">Welcome to BiteWise, ${fullName}!</h2>
          <p>Your dieteticien registration request has been approved.</p>
          <p>You can now log in to your account and start creating nutrition plans, writing blogs, and managing consultations.</p>
          <p style="margin-top: 24px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login"
               style="background-color: #2D5A27; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 8px; display: inline-block;">
              Log In Now
            </a>
          </p>
          <p style="margin-top: 24px; color: #6B7280; font-size: 14px;">
            Best regards,<br/>The BiteWise Team
          </p>
        </div>
      `,
    });
    console.log(`Approval email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send approval email:", error.message);
  }
};