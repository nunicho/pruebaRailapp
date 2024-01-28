const Router = require("express").Router;
const router = Router();
const multer = require("multer");
const UsersController = require("../controllers/users.controller.js");
const multerMiddleware = require("../middleware/multerMiddleware.js");
const getUsersDTO = require("../dto/dtoGetUsers.js");
const CustomError = require("../utils/customError.js");
const tiposDeError = require("../utils/tiposDeError.js");





router.get("/:id", UsersController.getUserById, (req, res) => {
  try {
    const usuarioDB = res.locals.usuarioDB;
    if (!usuarioDB) {
      return res.status(404).send("Usuario no encontrado");
    }
    res.header("Content-type", "application/json");
    res.status(200).json({ usuarioDB });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


// ---------------- MULTER ----------------------------///

router.post(
  "/:id/documents",
  multerMiddleware.uploadDocuments.single("foto"),
  async (req, res) => {
    try {
      const userId = req.params.id;
      const file = req.file;

      const updatedUser = await UsersController.handleDocumentUpload(
        userId,
        file
      );

      res
        .status(200)
        .json({ message: "Documento subido exitosamente", user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/:id/documents/products",
  multerMiddleware.uploadProducts.single("foto"),
  async (req, res) => {
    try {
      const userId = req.params.id;
      const file = req.file;

      const updatedUser = await UsersController.handleDocumentUpload(
        userId,
        file
      );

      res
        .status(200)
        .json({ message: "Producto subido exitosamente", user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/:id/documents/profiles",
  multerMiddleware.uploadProfiles.single("foto"),
  async (req, res) => {
    try {
      const userId = req.params.id;
      const file = req.file;

      const updatedUser = await UsersController.handleDocumentUpload(
        userId,
        file
      );

      res
        .status(200)
        .json({ message: "Profile subido exitosamente", user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);


router.post(
  "/:id/documents/identificacion",
  multerMiddleware.uploadIdentificacion.single("foto"),
  async (req, res) => {
    try {
      const userId = req.params.id;
      const file = req.file;

      const updatedUser = await UsersController.handleDocumentUpload(
        userId,
        file
      );

      res
        .status(200)
        .json({ message: "Identificacion subida exitosamente", user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);


router.post(
  "/:id/documents/domicilio",
  multerMiddleware.uploadDomicilio.single("foto"),
  async (req, res) => {
    try {
      const userId = req.params.id;
      const file = req.file;

      const updatedUser = await UsersController.handleDocumentUpload(
        userId,
        file
      );

      res
        .status(200)
        .json({
          message: "Comprobante de domicilio subido exitosamente",
          user: updatedUser,
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/:id/documents/cuenta",
  multerMiddleware.uploadCuenta.single("foto"),
  async (req, res) => {
    try {
      const userId = req.params.id;
      const file = req.file;

      const updatedUser = await UsersController.handleDocumentUpload(
        userId,
        file
      );

      res.status(200).json({
        message: "Estado de cuenta subido exitosamente",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ---------------- PREMIUM ----------------------------///


router.get("/premium/:id", UsersController.getUserRoleById);

router.post("/premium/:id/changeRole", UsersController.changeUserRole);


// ----------------  DTO GetUsers ----------------------------///


router.get("/", async (req, res) => {
  try {
    const users = await UsersController.DTOgetUsers();
    res.status(200).json(users); // Envia los usuarios como JSON al cliente
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// ---------------- Edit and Delete Users ----------------------///


router.put("/:id", async (req, res) => {
  try {
    await UsersController.updateUser(req, res);
  } catch (error) {
    res.status(500).json({ error: "Error inesperado", detalle: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await UsersController.deleteUser(req, res);
  } catch (error) {
    res.status(500).json({ error: "Error inesperado", detalle: error.message });
  }
});


// ----------------  Delete Users / 2 días ----------------------------///

router.delete("/", async (req, res) => {
  try {
    await UsersController.deleteInactiveUsers();
    res
      .status(200)
      .json({ message: "Usuarios inactivos eliminados exitosamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuarios inactivos." });
  }
});

module.exports = router;

