const Router = require("express").Router;
const router = Router();
const multer = require("multer");
const UsersController = require("../controllers/users.controller.js");
const multerMiddleware = require("../middleware/multerMiddleware.js");

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


module.exports = router;


/*
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/"); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/:id/documents", upload.single("foto"), async (req, res) => {
  try {
    const userId = req.params.id;
    const file = req.file;

    const updatedUser = await UsersController.handleDocumentUpload(userId, file);

    res.status(200).json({ message: "Documento subido exitosamente", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/