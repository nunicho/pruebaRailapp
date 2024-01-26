const mongoose = require("mongoose");
const carritosRepository = require("../dao/repository/carritos.repository.js");
const ticketController = require("../controllers/tickets.controller.js");
const usersController = require("../controllers/users.controller.js");

const productosController = require("../controllers/productos.controller.js");

const CustomError = require("../utils/customError.js");
const tiposDeError = require("../utils/tiposDeError.js");

const Carrito = require("../dao/Mongo/models/carritos.modelo.js");
const Producto = require("../dao/Mongo/models/productos.modelo.js");
const Usuario = require("../dao/Mongo/models/users.modelo.js");

const verCarritos = async (req, res) => {
  try {
    const carritos = await carritosRepository.verCarritos();
    res.status(200).json({ data: carritos });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const verCarritoConId = async (req, res, next) => {
  try {
    const cid = req.params.cid;

    if (!mongoose.Types.ObjectId.isValid(cid)) {
      throw new CustomError(
        "ERROR_DATOS",
        'Requiere un argumento "cid" de tipo ObjectId válido',
        tiposDeError.ERROR_DATOS,
        "El cid proporcionado no es válido"
      );
    }

    const carrito = await carritosRepository.verCarritoConId(cid);

    if (!carrito) {
      throw new CustomError(
        "CARRITO_NO_ENCONTRADO",
        `El carrito con ID ${cid} no existe`,
        tiposDeError.CARRITO_NO_ENCONTRADO,
        `El carrito con ID ${cid} no existe.`
      );
    }

    const productosEnCarrito = carrito.productos.map((productoEnCarrito) => ({
      producto: {
        ...productoEnCarrito.producto._doc,
      },
      quantity: productoEnCarrito.cantidad,
    }));

    const carritoResponse = {
      _id: carrito._id,
      productos: productosEnCarrito,
    };

    res.status(200).json(carritoResponse);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

async function createEmptyCart() {
  const carritoData = { productos: [], amount: 0 };
  const carrito = await carritosRepository.crearCarrito(carritoData);
  return carrito;
}

async function agregarProducto(req, res) {
  try {
    const { id } = req.params;
    const products = req.body.products;

    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ mensaje: "Formato de productos incorrecto" });
    }
    const usuario = await Usuario.findById(id).populate("cart");
    let carrito = usuario.cart;

    if (!carrito) {
      carrito = await createEmptyCart();
      usuario.cart = carrito;
      await usuario.save();
    }
    const productosConsolidados = {};
    products.forEach((product) => {
      const productoId = product.productoId;
      const cantidad = product.quantity;
      if (productosConsolidados[productoId]) {
        productosConsolidados[productoId] += cantidad;
      } else {
        productosConsolidados[productoId] = cantidad;
      }
    });
    let totalCarrito = carrito.amount || 0;
    for (const [productoId, cantidad] of Object.entries(
      productosConsolidados
    )) {
      console.log("El producto Id es:" + productoId);
      console.log("La cantidad es:" + cantidad);
      const producto = await productosController.obtenerProductoById(
        productoId
      );

      console.log("Producto encontrado:", producto);

      if (!producto) {
        console.log("Producto no encontrado. Producto:", producto);
        return res.status(400).json({ mensaje: "Producto no encontrado" });
      }
      const cantidadTotal =
        cantidad +
        carrito.productos
          .filter((item) => item.producto.toString() === productoId)
          .reduce((total, item) => total + item.cantidad, 0);
      if (producto.stock < cantidadTotal) {
        console.log("Stock insuficiente. Producto:", producto);
        return res.status(400).json({
          mensaje: `No hay suficiente stock para el producto con ID ${productoId}`,
        });
      }
      const productoExistente = carrito.productos.find(
        (item) => item.producto.toString() === productoId
      );
      if (productoExistente) {
        productoExistente.cantidad += cantidad;
      } else {
        carrito.productos.push({ producto: productoId, cantidad });
      }
      totalCarrito += producto.price * cantidad;
    }
    carrito.amount = totalCarrito;
    await carrito.save();

    console.log(
      "Productos agregados al carrito con éxito. Carrito actualizado:",
      carrito
    );

    return res
      .status(200)
      .json({ mensaje: "Productos agregados al carrito con éxito" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

async function realizarCompra(req, res) {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id).populate("cart");
    let carrito = usuario.cart;

    if (!carrito || carrito.productos.length === 0) {
      return res.status(400).json({ mensaje: "El carrito está vacío" });
    }

    let totalCarrito = carrito.amount || 0;

    for (const product of carrito.productos) {
      const productoId = product.producto.toString();
      const cantidadDeseada = product.cantidad;

      const producto = await productosController.obtenerProductoById(
        productoId
      );

      if (!producto || producto.stock < cantidadDeseada) {
        return res.status(400).json({
          mensaje: `No hay suficiente stock para el producto con ID ${productoId}, ${producto.title}`,
        });
      }
      producto.stock -= cantidadDeseada;
      await producto.save();
      totalCarrito += producto.price * cantidadDeseada;
    }

    const ticketInsertado = await ticketController.createTicket(
      totalCarrito,
      usuario.email
    );

    if (!ticketInsertado) {
      return res.status(500).json({ mensaje: "Error al generar el ticket" });
    }
    carrito.amount = totalCarrito;

    carrito.productos = [];
    carrito.amount = 0;

    await carrito.save();

    return res
      .status(200)
      .json({
        mensaje:
          `Compra realizada con éxito, se generó el ticket`,
        ticket: ticketInsertado,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

async function quitarProducto(req, res) {
  try {
    const { id } = req.params;
    const productId = req.body.productId;

    if (!productId) {
      return res
        .status(400)
        .json({ mensaje: "ID de producto no proporcionado" });
    }

    const usuario = await Usuario.findById(id).populate("cart");
    const carrito = usuario.cart;

    if (!carrito) {
      return res.status(400).json({ mensaje: "El carrito no existe" });
    }

    const productoIndex = carrito.productos.findIndex(
      (item) => item.producto.toString() === productId
    );

    if (productoIndex === -1) {
      return res
        .status(404)
        .json({ mensaje: "Producto no encontrado en el carrito" });
    }

    const producto = carrito.productos[productoIndex];
    const productoObject = await productosController.obtenerProductoById(
      productId
    );

    if (!productoObject) {
      return res.status(400).json({ mensaje: "Producto no encontrado" });
    }

    carrito.amount -= productoObject.price * producto.cantidad;

    carrito.productos.splice(productoIndex, 1);

    await carrito.save();

    return res
      .status(200)
      .json({ mensaje: "Producto quitado del carrito con éxito" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

async function limpiarCarrito(req, res) {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id).populate("cart");
    const carrito = usuario.cart;

    if (!carrito) {
      return res.status(400).json({ mensaje: "El carrito no existe" });
    }

    carrito.productos = [];
    carrito.amount = 0;

    await carrito.save();

    return res.status(200).json({ mensaje: "Carrito limpiado con éxito" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

async function mostrarCarrito(req, res) {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id).populate("cart");
    const carrito = usuario.cart;

    if (!carrito) {
      return res.status(400).json({ mensaje: "El carrito no existe" });
    }

    const productosEnCarrito = [];

    for (const product of carrito.productos) {
      const productoId = product.producto.toString();
      const producto = await productosController.obtenerProductoById(
        productoId
      );

      if (!producto) {
        return res.status(400).json({ mensaje: "Producto no encontrado" });
      }

      productosEnCarrito.push({
        id: productoId,
        nombre: producto.title,
        cantidad: product.cantidad,
        precioUnitario: producto.price,
        imagen: producto.thumbnail,
        code: producto.code,
        subtotal: producto.price * product.cantidad,
      });
    }

    const totalCarrito = carrito.amount || 0;

    return res.status(200).json({
      carrito: {
        productos: productosEnCarrito,
        total: totalCarrito,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

module.exports = {
  verCarritos,
  verCarritoConId,
  createEmptyCart,
  agregarProducto,
  realizarCompra,
  quitarProducto,
  limpiarCarrito,
  mostrarCarrito,
};
