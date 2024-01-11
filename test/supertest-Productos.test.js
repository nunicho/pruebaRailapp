const supertest = require("supertest");
const chai = require("chai");
const mongoose = require("mongoose");
const { describe, it } = require("mocha");
const config = require("../src/config/config.js");


async function runTests() {
  
  await mongoose.connect(config.MONGO_URL, { dbName: config.DB_NAME });

  const expect = chai.expect;
  const requester = supertest(config.DIRECCION_TEST_LOCALHOST);

  describe("Pruebas al proyecto Ecommerce - Productos", function () {
    this.timeout(6000);

    describe("SUPERTEST: Pruebas al módulo productos", function () {     
     
      
    after(async function () {
        await mongoose.connection.collection("productos").deleteMany({title:"SUPERTEST"});
      });


      it("SUPERTEST: El endpoint /api/products, con método POST, permite generar un producto nuevo en BD", async function () {
        let producto = {
          title: "SUPERTEST",
          description: "producto de Test",
          price: 20000,
          thumbnail: "https://example.com/new-thumbnail.png",
          code: "SUPERTEST",
          stock: 20,
        };
        let { body, ok, statusCode } = await requester
          .post("/api/products")
          .send(producto);
        expect(statusCode).to.be.equal(201);
        expect(ok).to.be.true;
        expect(body.productoInsertado).to.has.property("_id");
      });

      it("SUPERTEST: El endpoint /api/products, con método GET, obtiene productos de la Base de datos", async function () {
        const queryParams = {
          query: {},
          limit: 10,
          pagina: 1,
          sortQuery: {},
        };

        try {
          let { body, ok, statusCode } = await requester
            .get("/api/products")
            .query(queryParams);
          expect(statusCode).to.equal(200);
          expect(ok).to.be.true;
          expect(body.productos.docs).to.be.an("array");
        } catch (error) {
          console.error("Error:", error);
        }
      });
      
    });
  });
}

runTests();

