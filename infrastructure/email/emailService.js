const nodemailer = require("nodemailer");
const logger = require("../../utils/logger");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});

const sendOtpEmail = async ({ email, otp }) => {
  await transporter.sendMail({
    from: `"ABC Company 🔐" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔐 Your Verification Code - ABC Company",

    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>👋 Welcome to ABC Company</h2>

        <p>Use the code below to complete your login:</p>

        <div style="font-size: 28px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>

        <p>⏳ This code expires in <b>5 minutes</b></p>

        <hr/>

        <p style="font-size: 12px; color: gray;">
          If you did not request this, ignore this email.
        </p>
      </div>
    `,
  });

  logger.info({
    event: "OTP_EMAIL_SENT",
    email,
  });
};


const sendWelcomeEmail = async ({ email, name }) => {
  await transporter.sendMail({
    from: `"ABC Company 🎉" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🎉 Welcome to ABC Company!",

    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h1>🎉 Welcome ${name}</h1>

        <p>We're excited to have you at <b>ABC Company</b>.</p>

        <p>🚀 Here’s what you can do next:</p>

        <ul>
          <li>Complete your profile</li>
          <li>Explore our platform</li>
          <li>Secure your account</li>
        </ul>

        <p style="margin-top: 20px;">
          💡 Tip: Keep your account secure by enabling notifications.
        </p>

        <hr/>

        <p style="font-size: 12px; color: gray;">
          ABC Company - Building secure digital experiences.
        </p>
      </div>
    `,
  });

  logger.info({
    event: "WELCOME_EMAIL_SENT",
    email,
  });
};

 module.exports = {sendOtpEmail,sendWelcomeEmail};