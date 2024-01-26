const mongoose = require("mongoose");

const modeloUsuariosGithub = mongoose.model(
  "githubusers",
  new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: {
      type: String,
      unique: true,
    },
    age: Number,
    password: String,
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "carritos", // Asume que tu modelo de carrito se llama "carritos"
    },
    github: {},
    role: String,
    documents: [
      {
        name: String,
        reference: String,
      },
    ],
    last_connection: Date,
  })
);

module.exports = modeloUsuariosGithub;
