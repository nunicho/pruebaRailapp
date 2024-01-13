const express = require("express");
const swaggerUi = require("swagger-ui-express");
const configureChat = require("./config/chat.config.js");
const configureHandlebars = require("./config/handlebars.config.js");
const configureSwagger = require("./config/swagger.config.js");
const connectToDatabase = require("./config/database.config.js");
const sessionsConfig = require("./config/sessions.config.js");
const session = require("express-session");
const path = require("path");
const cookieParser = require("cookie-parser");
const app = express();


// Routers de MongoDB (DB)
const productsRouter = require("./router/products.router.js");
const cartsRouter = require("./router/carts.router.js");

// Router de Handlebars
const vistasRouter = require("./router/vistas.router.js");

// Router de Users
const usersRouter = require("./router/users.router.js");

// Router de Session
const sessionsRouter = require("./router/sessions.router.js");
const { json } = require("body-parser");
const { prototype } = require("module");

//MANEJO DE ERRORES
const errorHandler = require("./middleware/errorHandler.js");

// DOTENV
const config = require("./config/entorno.config.js");

//PASSPORT
const inicializaPassport = require("./config/passport.config.js");
const passport = require("passport");

// LOGGER
const { middLog } = require("./util.js");
app.use(middLog);

//SWAGGER
const specs = configureSwagger();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//PARA SESSION Y LOGIN
app.use(session(sessionsConfig));

//PARA INICIAR PASSPORT
inicializaPassport();
app.use(passport.initialize());
app.use(passport.session());

// PARA EL MANEJO DE COOKIES
app.use(cookieParser());

// Inicialización de routers
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/users", usersRouter);
app.use("/", vistasRouter);

//MULTER
const multer = require("multer");

// HANDLEBARS - inicialización
const hbs = configureHandlebars();
app.engine("handlebars", hbs.engine);
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

//app.use(express.static(__dirname + "/public"));
app.use(express.static(path.join(__dirname, "public")));

const PORT = config.PORT;
const serverExpress = app.listen(PORT, () => {
  console.log(`Server escuchando en puerto ${PORT}`);
});

connectToDatabase();

// WEBSOCKET Y CHAT
configureChat(serverExpress);

app.use(errorHandler);
