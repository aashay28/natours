const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // WE NEED TO CREATE A TRANSPORTER
  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME, // generated ethereal user
      pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    },
  });

  // WE NEED TO DEFINE EMAIL OPTIONS

  let info = await transporter.sendMail({
    from: '"Ahs👻" <fegesa2060@duiter.com>', // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
  });

  console.log("info", info.messageId);
};
module.exports = sendEmail;
