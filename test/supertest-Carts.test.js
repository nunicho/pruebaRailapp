const supertest = require("supertest");
const chai = require("chai");
const mongoose = require("mongoose");
const { describe, it } = require("mocha");
const config = require("../src/config/entorno.config.js");

async function runTests() {
  await mongoose.connect(config.MONGO_URL, { dbName: config.DB_NAME });

  const expect = chai.expect;
  console.log(config.DIRECCION_TEST_LOCALHOST);
  const requester = supertest(config.DIRECCION_TEST_LOCALHOST);

  describe("SUPERTEST: Pruebas al proyecto Ecommerce", function () {
    this.timeout(6000);

    describe("Pruebas al módulo carritos", function () {
      it("SUPERTEST: VER TODOS LOS CARRITOS: El endpoint /api/carts, con método GET, obtiene carritos de la Base de datos", async function () {
        let { body, ok, statusCode } = await requester.get("/api/carts");

        expect(statusCode).to.equal(200);
        expect(ok).to.be.true;
        expect(body).to.have.property("data").that.is.an("array");
      });

      it("SUPERTEST: VER CARRITO: El endpoint /api/carts/:cid, con método GET, obtiene un carrito por ID", async function () {
        const carritoId = config.CART_TEST_EJEMPLO;

        const { body, ok, statusCode } = await requester.get(
          `/api/carts/${carritoId}`
        );

        expect(statusCode).to.equal(200);
        expect(ok).to.be.true;
        expect(body).to.have.property("_id").that.is.equal(carritoId);
        expect(body).to.have.property("productos").that.is.an("array");
      });

      it("SUPERTEST: AGREGAR PRODUCTO: El endpoint /api/carts/:id/agregarProducto, con método POST, agrega productos al carrito", async function () {
        const userId = config.USER_TEST_EJEMPLO;
        const products = [
          { productoId: config.PRODUCTO_TEST_EJEMPLO, quantity: 2 },
        ];

        const { body, ok, statusCode } = await requester
          .post(`/api/carts/${userId}/agregarProducto`)
          .send({ products });

        expect(statusCode).to.equal(200);
        expect(ok).to.be.true;
        expect(body)
          .to.have.property("mensaje")
          .that.equals("Productos agregados al carrito con éxito");
      });

      it("SUPERTEST: QUITAR PRODUCTO: El endpoint /api/carts/:id/quitarProducto, con método POST, quita un producto del carrito", async function () {
        const userId = config.USER_TEST_EJEMPLO;
        const productId = config.PRODUCTO_TEST_EJEMPLO;
        const { body, ok, statusCode } = await requester
          .post(`/api/carts/${userId}/quitarProducto`)
          .send({ productId });

        expect(statusCode).to.equal(200);
        expect(ok).to.be.true;
        expect(body)
          .to.have.property("mensaje")
          .that.equals("Producto quitado del carrito con éxito");
      });

      it("SUPERTEST: LIMPIAR CARRITO: El endpoint /api/carts/:id/agregarProducto, con método POST, agrega productos al carrito y luego limpia el carrito", async function () {
        const userId = config.USER_TEST_EJEMPLO;
        const products = [
          { productoId: config.PRODUCTO_TEST_EJEMPLO, quantity: 2 },
        ];

        const agregarProductoResponse = await requester
          .post(`/api/carts/${userId}/agregarProducto`)
          .send({ products });

        expect(agregarProductoResponse.statusCode).to.equal(200);
        expect(agregarProductoResponse.ok).to.be.true;
        expect(agregarProductoResponse.body)
          .to.have.property("mensaje")
          .that.equals("Productos agregados al carrito con éxito");

        const limpiarCarritoResponse = await requester.post(
          `/api/carts/${userId}/limpiarCarrito`
        );
        expect(limpiarCarritoResponse.statusCode).to.equal(200);
        expect(limpiarCarritoResponse.ok).to.be.true;
        expect(limpiarCarritoResponse.body)
          .to.have.property("mensaje")
          .that.equals("Carrito limpiado con éxito");
      });

      it("SUPERTEST: REALIZAR COMPRA: El endpoint /api/carts/:id/agregarProducto, con método POST, agrega productos al carrito y luego realiza la compra", async function () {
        const userId = config.USER_TEST_EJEMPLO;
        const products = [
          { productoId: config.PRODUCTO_TEST_EJEMPLO, quantity: 2 },
        ];

        const agregarProductoResponse = await requester
          .post(`/api/carts/${userId}/agregarProducto`)
          .send({ products });

        expect(agregarProductoResponse.statusCode).to.equal(200);
        expect(agregarProductoResponse.ok).to.be.true;
        expect(agregarProductoResponse.body)
          .to.have.property("mensaje")
          .that.equals("Productos agregados al carrito con éxito");

        const realizarCompraResponse = await requester.post(
          `/api/carts/${userId}/purchase`
        );

        expect(realizarCompraResponse.statusCode).to.equal(200);
        expect(realizarCompraResponse.ok).to.be.true;
        expect(realizarCompraResponse.body)
          .to.have.property("mensaje")
          .that.equals("Compra realizada con éxito, se generó el ticket");
      });
    });
  });
}

runTests();
