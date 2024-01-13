//const session = require("express-session");
const ConnectMongo = require("connect-mongo");
const config = require("./config.js"); 

const sessionStore = ConnectMongo.create({
  mongoUrl: `${config.MONGO_URL}&dbName=${config.DB_NAME}`,
  ttl: 3600,
});

const sessionsConfig = {
  secret: config.SESSIONS_PASSWORD,
  resave: true,
  saveUninitialized: true,
  store: sessionStore,
};

module.exports = sessionsConfig;
