const express = require("express");
const router = express.Router();
const entornoConfig = require("../config/entorno.config.js");
const util = require("../util.js");
const usersController = require("../controllers/users.controller.js");

const nodemailerJwtConfig = require("../config/nodemailer-jwt.config.js");
const { transporter, createResetToken } = nodemailerJwtConfig;
//const UsersController = require("./controllers/users.controller.js");

//PARA TRAER PASSPORT

const passport = require("passport");

router.get("/errorRegistro", (req, res) => {
  try {
    req.logger.error("Error en la ruta de error de registro");
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      error: "Error de registro",
      // AQUÍ SE PODRÍA PONER UN REDIRECT
    });
  } catch (error) {
    req.logger.error(
      `Error al manejar la ruta de error de registro - Detalle: ${error.message}`
    );
    res.status(500).send("Error interno del servidor");
  }
});

// Ruta de registro
router.post("/registro", util.passportCallRegister("registro"), (req, res) => {
  try {
    if (req.user) {
      req.session.usuario = req.user;
      req.logger.info(`Registro exitoso - Usuario: ${req.user.username}`);
      return res.redirect("/");
    } else {
      const error = req.body.error;
      req.logger.fatal(`Error en la ruta de registro - Detalle: ${error}`);
      return res.redirect("login", { error });
    }
  } catch (error) {
    req.logger.error(
      `Error al manejar la ruta de registro - Detalle: ${error.message}`
    );
    res.status(500).send("Error interno del servidor");
  }
});

router.post("/login", util.passportCall("loginLocal"), (req, res) => {
  try {
    if (req.user) {
      req.session.usuario = req.user;
      req.logger.info(
        `Inicio de sesión exitoso - Usuario: ${req.session.usuario.email}`
      );
      return res.redirect("/");
    } else {
      const error = req.body.error;
      req.logger.error(`Error en la ruta de login - Detalle: ${error}`);
      return res.redirect("/login?error=" + encodeURIComponent(error));
    }
  } catch (error) {
    req.logger.fatal(
      `Error al manejar la ruta de login - Detalle: ${error.message}`
    );
    res.status(500).send("Error interno del servidor");
  }
});

router.get("/logout", async (req, res) => {
  try {
    const usuario = req.session.usuario;
    if (usuario && usuario.email) {
      if (usuario.role && usuario.role === "administrador") {
        // Si es un administrador, simplemente realizar el logout sin el updateLastConnection
        req.logger.info(
          `Logout exitoso como administrador - Mail: ${usuario.email}`
        );
      } else {
        // No es un administrador, realizar el updateLastConnection
        if (usuario.github) {
          await usersController.updateLastConnectionGithub(usuario.email);
        } else {
          // Verificar si la propiedad updateLastConnection existe en usersController
          if (usersController.updateLastConnection) {
            await usersController.updateLastConnection(usuario.email);
          } else {
            // Si no existe la propiedad, hacer algo (puedes loggear un mensaje, por ejemplo)
            req.logger.warn(
              "La propiedad updateLastConnection no está definida en usersController"
            );
          }
        }
        req.logger.info(`Logout exitoso - Mail: ${usuario.email}`);
      }

      req.session.destroy((e) => {
        if (e) {
          req.logger.error(
            `Error al destruir la sesión - Detalle: ${e.message}`
          );
          res.status(500).send("Error interno del servidor");
        } else {
          res.redirect("/login?mensaje=Logout correcto!");
        }
      });
    } else {
      req.logger.error(
        `No se encontró información de usuario en la sesión durante el logout`
      );
      res.status(500).send("Error interno del servidor");
    }
  } catch (error) {
    req.logger.error(
      `Error al manejar la ruta de logout - Detalle: ${error.message}`
    );
    res.status(500).send("Error interno del servidor");
  }
});

router.get(
  "/github",
  (req, res, next) => {
    passport.authenticate("loginGithub", {
      successRedirect: "/",
      failureRedirect: "/api/sessions/errorGithub",
    })(req, res, next);
  },
  (req, res) => {
    try {
      if (req.user) {
        req.logger.info(
          `Inicio de sesión exitoso con GitHub - Usuario: ${req.user.username}`
        );
      } else {
        req.logger.fatal(`Fallo en la autenticación con GitHub`);
      }
    } catch (error) {
      req.logger.error(
        `Error al manejar la autenticación con GitHub - Detalle: ${error.message}`
      );
      res.status(500).send("Error interno del servidor");
    }
  }
);

router.get(
  "/callbackGithub",
  passport.authenticate("loginGithub", {
    failureRedirect: "/api/sessions/errorGithub",
  }),
  (req, res) => {
    req.session.usuario = req.user;
    res.redirect("/");
  }
);

router.get("/errorGithub", (req, res) => {
  res.setHeader("Content-type", "application/json");
  res.status(200).json({
    error: "Error en github",
  });
});

// LOGIN DEL ADMINISTRADOR

router.post("/loginAdmin", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      req.logger.error("Faltan datos en la solicitud");
      return res.redirect("/loginAdmin?error=Faltan datos");
    }
    if (
      email === entornoConfig.ADMIN_EMAIL &&
      password === entornoConfig.ADMIN_PASSWORD
    ) {
      req.session.usuario = {
        nombre: entornoConfig.ADMIN_USER,
        email: entornoConfig.ADMIN_EMAIL,
        role: "administrador",
      };
      req.logger.info(
        `Inicio de sesión exitoso como administrador - Administrador: ${entornoConfig.ADMIN_EMAIL}`
      );
      return res.redirect("/");
    } else {
      req.logger.error(
        "Credenciales incorrectas para el inicio de sesión como administrador"
      );
      return res.redirect("/loginAdmin?error=Credenciales incorrectas");
    }
  } catch (error) {
    req.logger.fatal(
      `Error al manejar la solicitud de inicio de sesión como administrador - Detalle: ${error.message}`
    );
    res.status(500).send("Error interno del servidor");
  }
});



router.post("/forgotPassword", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await usersController.getUserByEmail(email);

    if (!user) {
      return res.status(404).send("Usuario no encontrado");
    }
    const resetToken = createResetToken(user);
    user.reset_password_token = resetToken;
    user.reset_password_expires = Date.now() + 3600000;
    await user.save();
    req.session.resetToken = resetToken;
    const resetLink = `http://localhost:${entornoConfig.PORT}/resetPassword?token=${resetToken}`;
    const mailOptions = {
      from: "noresponder-ferreteriaeltornillo@gmail.com",
      to: user.email,
      subject: "Restablecimiento de contraseña",
      html: `Haga clic en el siguiente enlace para restablecer su contraseña: <a href="${resetLink}">${resetLink}</a>`,
    };
    await transporter.sendMail(mailOptions);
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

router.get("/", async (req, res) => {
  try {
    const users = await usersController.getUsers(req, res);
     res.status(200).json(users);
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
