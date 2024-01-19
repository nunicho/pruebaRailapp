const mongoose = require("mongoose");

const modeloUsuariosGithub = mongoose.model(
  "githubusers",
  new mongoose.Schema({
    nombre: String,
    email: {
      type: String,
      unique: true,
    },
    password: String,
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
