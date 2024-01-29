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

const productsRouter = require("./router/products.router.js");
const cartsRouter = require("./router/carts.router.js");
const vistasRouter = require("./router/vistas.router.js");
const usersRouter = require("./router/users.router.js");
const sessionsRouter = require("./router/sessions.router.js");
const errorHandler = require("./middleware/errorHandler.js");
const config = require("./config/entorno.config.js");
const inicializaPassport = require("./config/passport.config.js");
const passport = require("passport");
const { middLog } = require("./util.js");
app.use(middLog);
const specs = configureSwagger();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionsConfig));

inicializaPassport();
app.use(passport.initialize());
app.use(passport.session());


app.use(cookieParser());

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/users", usersRouter);
app.use("/", vistasRouter);

const hbs = configureHandlebars();
app.engine("handlebars", hbs.engine);
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");


app.use(express.static(path.join(__dirname, "public")));

const PORT = config.PORT;
const serverExpress = app.listen(PORT, () => {
  console.log(`Server escuchando en puerto ${PORT}`);
});

connectToDatabase();


configureChat(serverExpress);

app.use(errorHandler);
