//const session = require("express-session");
const ConnectMongo = require("connect-mongo");
const entornoConfig = require("./entorno.config.js");

const sessionStore = ConnectMongo.create({
  mongoUrl: `${entornoConfig.MONGO_URL}&dbName=${entornoConfig.DB_NAME}`,
  ttl: 3600,
});

const sessionsConfig = {
  secret: entornoConfig.SESSIONS_PASSWORD,
  resave: true,
  saveUninitialized: true,
  store: sessionStore,
};

module.exports = sessionsConfig;
