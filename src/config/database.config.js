const mongoose = require("mongoose");
const entornoConfig = require("./entorno.config.js"); 
const connectToDatabase = async () => {
  try {
    await mongoose.connect(entornoConfig.MONGO_URL, {
      dbName: entornoConfig.DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB Conectada");
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error.message);
  }
};

module.exports = connectToDatabase;
