const express = require("express");
const swagger_jsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const http = require("http");
const socketIO = require("socket.io");
const MessageModel = require("./dao/DB/models/messages.modelo.js");
const configureChat = require("./config/chat.config.js");

const configureHandlebars = require("./config/handlebars.config.js")
const configureSwagger = require("./config/swagger.config.js");
const connectToDatabase = require("./config/database.config.js")

const moongose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();

//MANEJO DE ERRORES
const errorHandler = require("./middleware/errorHandler.js");

// DOTENV
const config = require("./config/config.js");

//SESSION
const session = require("express-session");
const ConnectMongo = require("connect-mongo");

//PASSPORT

const inicializaPassport = require("./config/passport.config.js");
const passport = require("passport");

// NODEMAILER y JWT
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const async = require("async");


const PORT = config.PORT;

// LOGGER
const { middLog } = require("./util.js");
app.use(middLog);

//SWAGGER

const specs = configureSwagger();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//PARA SESSION Y LOGIN

const sessionStore = ConnectMongo.create({
  mongoUrl: `${config.MONGO_URL}&dbName=${config.DB_NAME}`,

  ttl: 3600,
});

app.use(
  session({
    secret: config.SESSIONS_PASSWORD,
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
  })
);

//PARA INICIAR PASSPORT

inicializaPassport();
app.use(passport.initialize());
app.use(passport.session());

// PARA EL MANEJO DE COOKIES
app.use(cookieParser());

// Routers de FileSystem (FS)
const FSproductsRouter = require("./dao/fileSystem/routes/FSproducts.router.js");
const FScartsRouter = require("./dao/fileSystem/routes/FScarts.router.js");

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

// Inicialización de routers
app.use("/api/fsproducts", FSproductsRouter);
app.use("/api/fscarts", FScartsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/users", usersRouter);
app.use("/", vistasRouter);

//MULTER
const multer = require("multer");
const upload = multer({ dest: "src/uploads/" });

app.post("api/users/:id/documents", upload.single("avatar"), (req, res) => {
  console.log(req.file);

  console.log(req.body);
  res.status(200).send("Imagen procesada");
});

app.post("/profile", upload.single("avatar"), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
});

// HANDLEBARS - inicialización
const hbs = configureHandlebars();
app.engine("handlebars", hbs.engine);
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");


// NODEMAILER Y JWT PARA CAMBIO DE CONTRASEÑA
const UsersController = require("./controllers/users.controller.js");
// Configuración del transporte de nodemailer (usando un servicio de prueba)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.SMTP_USER, // Coloca tu dirección de correo aquí
    pass: config.SMTP_PASSWORD, // Coloca tu contraseña aquí
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

app.post("/forgotPassword", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UsersController.getUserByEmail(email);

    if (!user) {
      return res.status(404).send("Usuario no encontrado");
    }

    const resetToken = createResetToken(user, secret);
    user.reset_password_token = resetToken;
    user.reset_password_expires = Date.now() + 3600000;

    await user.save();

    // Almacena el token completo en la sesión
    req.session.resetToken = resetToken;

    const resetLink = `http://localhost:${config.PORT}/resetPassword?token=${resetToken}`;
    const mailOptions = {
      from: "noresponder-ferreteriaeltornillo@gmail.com",
      to: user.email,
      subject: "Restablecimiento de contraseña",
      html: `Haga clic en el siguiente enlace para restablecer su contraseña: <a href="${resetLink}">${resetLink}</a>`,
    };

    await transporter.sendMail(mailOptions);

    res;
    res.status(200).render("login", {
      successPasswordMessage:
        "Se ha enviado un correo con las instrucciones para restablecer la contraseña.",
      estilo: "login.css",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});




//app.use(express.static(__dirname + "/public"));
app.use(express.static(path.join(__dirname, "public")));

const serverExpress = app.listen(PORT, () => {
  console.log(`Server escuchando en puerto ${PORT}`);
});

connectToDatabase();


// WEBSOCKET Y CHAT
configureChat(serverExpress);

app.use(errorHandler);
