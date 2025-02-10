const nodemailer = require("nodemailer");
require("dotenv").config();

exports.generateOtp = () => {
    let otp = ''

    for (let i = 0; i <= 3; i++) {
        const rand = Math.round(Math.random() * 9);
        otp = otp + rand;

    }
    return otp;
}

// const nodemailer = require("nodemailer");

exports.mailTransport = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Prevents issues with self-signed certificates
    },
  });


      exports.GeneratePasswordResetTemplate = (url) => {
        return `
         <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <h2 style="color: #333;">Reset Your Password</h2>
                <p style="color: #555;">
                    You requested to reset your password. Click the button below to proceed:
                </p>
                <a href="${url}" style="
                    background-color: #007BFF;
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    display: inline-block;
                    border-radius: 5px;
                    font-size: 16px;
                    margin-top: 10px;
                ">Reset Password</a>
                <p style="color: #777; font-size: 14px; margin-top: 10px;">
                    If you didn't request this, please ignore this email.
                </p>
                <p style="color: #777; font-size: 14px;">
                    Thanks,<br/>Your Company Name
                </p>
            </div>
        `;
    };
    