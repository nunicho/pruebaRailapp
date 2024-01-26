const Router = require("express").Router;
const router = Router();
const multer = require("multer");
const UsersController = require("../controllers/users.controller.js");
const multerMiddleware = require("../middleware/multerMiddleware.js");
const getUsersDTO = require("../dto/dtoGetUsers.js");
const CustomError = require("../utils/customError.js");
const tiposDeError = require("../utils/tiposDeError.js");

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

/*
router.get("/", async (req, res) => {
  try {
    const users = await UsersController.getUsers();
    const usersDTO = getUsersDTO(users);
    res.status(200).json(usersDTO);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/
router.get("/", UsersController.DTOgetUsers);


module.exports = router;

