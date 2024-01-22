const express = require("express");
const router = express.Router();
const carritosController = require("../controllers/carritos.controller.js")
const usersController = require("../controllers/users.controller.js")



router.get("/", (req, res) => {
  try {
    req.logger.info(`Acceso exitoso a la ruta de ver carritos`);
    carritosController.verCarritos(req, res);
  } catch (error) {
    req.logger.error(
      `Error al acceder a la ruta de ver carritos - Detalle: ${error.message}`
    );
    res.status(500).send("Error interno del servidor");
  }
});

router.get("/:cid", async (req, res) => {
  try {
    req.logger.info(`Acceso exitoso a la ruta de ver carrito`);
    carritosController.verCarritoConId(req, res);
  } catch (error) {
    req.logger.error(
      `Error al acceder a la ruta de ver carrito con ID - Detalle: ${error.message}`
    );
    res.status(500).send("Error interno del servidor");
  }
});

router.post("/:id/purchase", carritosController.realizarCompra);
/*
router.post(
  "/:id/crear-carrito",
  usersController.getUserById,
  carritosController.crearCarrito
);
*/

/*
router.post("/:id/crear-carrito", async (req, res) => {
  await carritosController.crearCarrito(req, res);
});

*/

router.post(
  "/:id/agregarProducto",
  usersController.getUserById,
  carritosController.agregarProducto
);



module.exports = router;

