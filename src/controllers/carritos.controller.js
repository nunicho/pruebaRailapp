const mongoose = require("mongoose");
const carritosRepository = require("../dao/repository/carritos.repository.js");
const ticketController = require("./tickets.controller");
const usersController = require("../controllers/users.controller.js")

const productosController = require("../controllers/productos.controller.js");

const CustomError = require("../utils/customError.js");
const tiposDeError = require("../utils/tiposDeError.js");


const Carrito = require("../dao/Mongo/models/carritos.modelo.js")
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


const crearCarrito = async (req, res) => {
  try {
    const usuario = res.locals.usuarioDB;
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const carritoToAdd = req.body;

    if (!carritoToAdd.products || !Array.isArray(carritoToAdd.products)) {
      throw new CustomError(
        "ERROR_DATOS",
        "Productos no válidos",
        tiposDeError.ERROR_DATOS,
        "La propiedad 'products' debe ser un array y estar definida."
      );
    }

    const hasMissingFields = carritoToAdd.products.some(
      (product) => !product.id || !product.quantity
    );

    if (hasMissingFields || carritoToAdd.products.length === 0) {
      throw new CustomError(
        "ERROR_DATOS",
        'Los productos deben tener campos "id" y "quantity" completos',
        tiposDeError.ERROR_DATOS,
        "Faltan datos obligatorios para crear el carrito."
      );
    }

    const productIds = carritoToAdd.products.map((product) => product.id);

    for (const productId of productIds) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new CustomError(
          "ERROR_DATOS",
          "ID inválido",
          tiposDeError.ERROR_ID_CARRITO,
          "El ID proporcionado no es válido."
        );
      }
    }

    const insufficientStockProducts = [];
    const groupedProducts = {};
    let totalAmount = 0;

    // Obtener el carrito existente del usuario
    const carritoExistente = await carritosRepository.obtenerCarritoPorUsuario(
      usuario._id
    );

    for (const product of carritoToAdd.products) {
      const { id, quantity } = product;

      const productInDB = await productosController.obtenerProductoById(id);

      if (!productInDB) {
        throw new CustomError(
          "PRODUCTO_NO_ENCONTRADO",
          `Producto con ID ${id} no encontrado`,
          tiposDeError.PRODUCTO_NO_ENCONTRADO,
          `El producto con ID ${id} no existe.`
        );
      }

      if (productInDB.stock < quantity) {
        insufficientStockProducts.push({
          id,
          quantity,
          availableStock: productInDB.stock,
        });
      }

      // Almacenar el producto y la cantidad en lugar del ID directo
      groupedProducts[id] = {
        producto: productInDB,
        cantidad: parseInt(quantity, 10),
      };

      totalAmount += productInDB.price * quantity;
    }

    if (insufficientStockProducts.length > 0) {
      return res.status(400).json({
        error: "No hay suficiente stock para algunos productos en el carrito.",
        insufficientStockProducts,
      });
    }

    // Actualizar el carrito existente con los nuevos productos
    if (carritoExistente) {
      for (const productKey in groupedProducts) {
        const productInfo = groupedProducts[productKey];
        const existingProductIndex = carritoExistente.productos.findIndex(
          (p) => p.producto.toString() === productKey
        );

        if (existingProductIndex !== -1) {
          // El producto ya existe en el carrito, actualizar cantidad
          carritoExistente.productos[existingProductIndex].cantidad +=
            productInfo.cantidad;
        } else {
          // El producto no existe en el carrito, agregarlo
          carritoExistente.productos.push({
            producto: productInfo.producto._id,
            cantidad: productInfo.cantidad,
          });
        }
      }

      // Actualizar el monto total
      carritoExistente.amount += totalAmount;

      // Guardar el carrito actualizado
      await carritoExistente.save();
    } else {
      // Crear un nuevo carrito si no existe uno para el usuario
      const carritoData = {
        usuario: usuario._id,
        productos: Object.keys(groupedProducts).map((id) => ({
          producto: id,
          cantidad: groupedProducts[id].cantidad,
        })),
        amount: totalAmount,
      };

      await carritosRepository.crearCarrito(carritoData);
    }

    const ticketInsertado = await ticketController.createTicket(
      totalAmount,
      req.session.usuario ? req.session.usuario.email : "usuario_desconocido"
    );

    for (const product of carritoToAdd.products) {
      const id = product.id;
      const productInDB = await productosController.obtenerProductoById(id);
      productInDB.stock -= product.quantity;
      await productInDB.save();
    }

    res
      .status(201)
      .json({ mensaje: "Carrito actualizado correctamente", ticketInsertado });
  } catch (error) {
    res.status(500).json({ error: "Error inesperado", detalle: error.message });
  }
};

module.exports = {
  crearCarrito,
};

/*
const crearCarrito = async (req, res) => {
  try {
    const userId = req.params.id; 
       const usuario = await usersController.getUserById(userId);
    if (!usuario) {
      return res
        .status(404)
        .json({ error: `Usuario con id ${userId} no encontrado` });
    }

    const carritoToAdd = req.body;

    const hasMissingFields = carritoToAdd.products.some(
      (product) => !product.id || !product.quantity
    );

    if (hasMissingFields || carritoToAdd.products.length === 0) {
      throw new CustomError(
        "ERROR_DATOS",
        'Los productos deben tener campos "id" y "quantity" completos',
        tiposDeError.ERROR_DATOS,
        "Faltan datos obligatorios para crear el carrito."
      );
    }

    const productIds = carritoToAdd.products.map((product) => product.id);

    for (const productId of productIds) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new CustomError(
          "ERROR_DATOS",
          "ID inválido",
          tiposDeError.ERROR_ID_CARRITO,
          "El ID proporcionado no es válido."
        );
      }
    }

    const insufficientStockProducts = [];

    for (const product of carritoToAdd.products) {
      const { id, quantity } = product;

      const productInDB = await productosController.obtenerProductoById(id);

      if (!productInDB) {
        throw new CustomError(
          "PRODUCTO_NO_ENCONTRADO",
          `Producto con ID ${id} no encontrado`,
          tiposDeError.PRODUCTO_NO_ENCONTRADO,
          `El producto con ID ${id} no existe.`
        );
      }

      if (productInDB.stock < quantity) {
        insufficientStockProducts.push({
          id,
          quantity,
          availableStock: productInDB.stock,
        });
      }
    }

    if (insufficientStockProducts.length > 0) {
      return res.status(400).json({
        error: "No hay suficiente stock para algunos productos en el carrito.",
        insufficientStockProducts,
      });
    }

    const groupedProducts = {};
    let totalAmount = 0;

    for (const product of carritoToAdd.products) {
      const { id, quantity } = product;

      const productInDB = await productosController.obtenerProductoById(id);

      if (!productInDB) {
        return res
          .status(404)
          .json({ error: `Producto con id ${id} no encontrado` });
      }

      totalAmount += productInDB.price * quantity;

      if (!groupedProducts[id]) {
        groupedProducts[id] = parseInt(quantity, 10);
      } else {
        groupedProducts[id] += parseInt(quantity, 10);
      }
    }

    // Crear el objeto carritoData con el ID del usuario
    const carritoData = {
      usuario: userId, // Asociar el carrito al usuario
      productos: Object.keys(groupedProducts).map((id) => ({
        producto: id,
        cantidad: groupedProducts[id],
      })),
      amount: totalAmount,
    };

    let carritoInsertado = await carritosRepository.crearCarrito(carritoData);

    const ticketInsertado = await ticketController.createTicket(
      totalAmount,
      req.session.usuario ? req.session.usuario.email : "usuario_desconocido"
    );

    for (const product of carritoToAdd.products) {
      const id = product.id;
      const productInDB = await productosController.obtenerProductoById(id);
      productInDB.stock -= product.quantity;
      await productInDB.save();
    }

    res.status(201).json({ carritoInsertado, ticketInsertado });
  } catch (error) {
    res.status(500).json({ error: "Error inesperado", detalle: error.message });
  }
};
*/





async function createEmptyCart() {
  const carritoData = { productos: [], amount: 0 };
  const carrito = await carritosRepository.crearCarrito(carritoData);
  return carrito
}


async function agregarProducto(req, res) {
  try {
    let { id } = req.params; // ID del usuario
    let { productoId, cantidad } = req.body; // ID del producto y cantidad a agregar
      console.log("El body es", JSON.stringify(req.body));
    // Buscar el carrito del usuario
    const usuario = await Usuario.findById(id).populate("cart");
    const carrito = usuario.cart;

   // productoId = "6574c70f0b46a1b44e031ebc";
  // cantidad = 1

    console.log("El producto Id es:" + productoId);
    console.log("La cantidad es:" + cantidad);

    // Verificar si el producto existe y hay suficiente stock
    //const producto = await Producto.findById(productoId);
    const producto = await productosController.obtenerProductoById(productoId)

    console.log("Producto encontrado:", producto);

    if (!producto || producto.stock < cantidad) {
      console.log(
        "Producto no encontrado o stock insuficiente. Producto:",
        producto
      );
      return res
        .status(400)
        .json({ mensaje: "Producto no encontrado o stock insuficiente" });
    }

    // Agregar el producto al carrito
    carrito.productos.push({ producto: productoId, cantidad });
    carrito.amount += producto.price * cantidad;

    // Guardar los cambios en el carrito
    await carrito.save();

    console.log(
      "Producto agregado al carrito con éxito. Carrito actualizado:",
      carrito
    );

    return res
      .status(200)
      .json({ mensaje: "Producto agregado al carrito con éxito" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

module.exports = {
  verCarritos,
  verCarritoConId,
  crearCarrito,
  createEmptyCart,
  agregarProducto,
};



/*
const crearCarrito = async (req, res) => {
  try {
    const carritoToAdd = req.body;

    const hasMissingFields = carritoToAdd.products.some(
      (product) => !product.id || !product.quantity
    );

    if (hasMissingFields || carritoToAdd.products.length === 0) {
      throw new CustomError(
        "ERROR_DATOS",
        'Los productos deben tener campos "id" y "quantity" completos',
        tiposDeError.ERROR_DATOS,
        "Faltan datos obligatorios para crear el carrito."
      );
    }

    const productIds = carritoToAdd.products.map((product) => product.id);

    for (const productId of productIds) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
          throw new CustomError(
            "ERROR_DATOS",
            "ID inválido",
            tiposDeError.ERROR_ID_CARRITO,
            "El ID proporcionado no es válido."
          );
        }
      }
    }

    const insufficientStockProducts = [];

    for (const product of carritoToAdd.products) {
      const { id, quantity } = product;

      const productInDB = await productosController.obtenerProductoById(id);

      if (!productInDB) {
        throw new CustomError(
          "PRODUCTO_NO_ENCONTRADO",
          `Producto con ID ${id} no encontrado`,
          tiposDeError.PRODUCTO_NO_ENCONTRADO,
          `El producto con ID ${id} no existe.`
        );
      }

      if (productInDB.stock < quantity) {
        insufficientStockProducts.push({
          id,
          quantity,
          availableStock: productInDB.stock,
        });
      }
    }

    if (insufficientStockProducts.length > 0) {
      return res.status(400).json({
        error: "No hay suficiente stock para algunos productos en el carrito.",
        insufficientStockProducts,
      });
    }

  
    const groupedProducts = {};
    let totalAmount = 0;

    for (const product of carritoToAdd.products) {
      const { id, quantity } = product;

      const productInDB = await productosController.obtenerProductoById(id);

      if (!productInDB) {
        return res
          .status(404)
          .json({ error: `Producto con id ${id} no encontrado` });
      }

      totalAmount += productInDB.price * quantity;

      if (!groupedProducts[id]) {
        groupedProducts[id] = parseInt(quantity, 10);
      } else {
        groupedProducts[id] += parseInt(quantity, 10);
      }
    }

    const carritoData = {
      productos: Object.keys(groupedProducts).map((id) => ({
        producto: id,
        cantidad: groupedProducts[id],
      })),
      amount: totalAmount,
    };

    let carritoInsertado = await carritosRepository.crearCarrito(carritoData);

const ticketInsertado = await ticketController.createTicket(
  totalAmount,
  req.session.usuario ? req.session.usuario.email : "usuario_desconocido"
);

    for (const product of carritoToAdd.products) {
      const id = product.id;
      const productInDB = await productosController.obtenerProductoById(id);
      productInDB.stock -= product.quantity;
      await productInDB.save();
    }

    res.status(201).json({ carritoInsertado, ticketInsertado });
  } catch (error) {
    res.status(500).json({ error: "Error inesperado", detalle: error.message });
  }
};
*/