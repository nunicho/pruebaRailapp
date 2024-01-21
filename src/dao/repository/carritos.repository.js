const CarritosMongoDao = require("../Mongo/carritosMongoDao");

class CarritosRepository {
  async verCarritos() {
    return CarritosMongoDao.verCarritos();
  }

  async verCarritoConId(carritoId) {
    return CarritosMongoDao.verCarritoConId(carritoId);
  }

  async crearCarrito(carritoData) {
    return CarritosMongoDao.crearCarrito(carritoData);
  }

  async obtenerCarritoPorUsuario(usuarioId) {
    return CarritosMongoDao.obtenerCarritoPorUsuario(usuarioId);
  }
}

module.exports = new CarritosRepository();
