const mongoose = require("mongoose");
const Producto = require("./models/productos.modelo.js");
const carritosModelo = require("./models/carritos.modelo.js");

class CarritosMongoDao {
  async verCarritos() {
    return carritosModelo.find();
  }

  async verCarritoConId(carritoId) {
    return carritosModelo.findOne({ _id: carritoId }).populate({
      path: "productos.producto",
      model: Producto,
    });
  }

  async crearCarrito(carritoData) {
    const carrito = new carritosModelo(carritoData);
    return carrito.save();
  }
  async obtenerCarritoPorUsuario(usuarioId) {
    try {
      const carrito = await carritosModelo.findOne({ usuario: usuarioId });
      return carrito;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CarritosMongoDao();
