const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const config = require("./config.js");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASSWORD,
  },
});

const secret = config.SECRET;

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

module.exports = {
  transporter,
  createResetToken,
};
