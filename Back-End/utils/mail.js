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

exports.mailTransport =() =>
    nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: 587,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false 
        }
      });


