const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const entornoConfig = require("./entorno.config.js");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: entornoConfig.SMTP_USER,
    pass: entornoConfig.SMTP_PASSWORD,
  },
});

const secret = entornoConfig.SECRET;

const createResetToken = (user) => {
  const tokenObject = {
    email: user.email,
    id: user._id,
  };
  const expirationTime = 3600;
  const resetToken = jwt.sign(tokenObject, secret, {
    expiresIn: expirationTime,
  });
  return resetToken;
};

const sendInactiveUserEmail = async (to, subject, text) => {
  const mailOptions = {
    from: entornoConfig.SMTP_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email enviado a ${to}`);
  } catch (error) {
    console.error(`Error al enviar email a ${to}:`, error.message);
  }
};


module.exports = {
  transporter,
  createResetToken,
  sendInactiveUserEmail,
};
