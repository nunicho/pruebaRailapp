const supertest = require("supertest");
const chai = require("chai");
const mongoose = require("mongoose");
const { describe, it } = require("mocha");
const config = require("../src/config/config.js");

async function runTests() {
  await mongoose.connect(config.MONGO_URL, { dbName: config.DB_NAME });

  const expect = chai.expect;
  const requester = supertest("http://localhost:8080");

  describe("SUPERTEST - Pruebas al proceso de autenticación usando Sessions", function () {
    this.timeout(6000);
    let cookie;

    after(async function () {
      await mongoose.connection
        .collection("users")
        .deleteMany({ email: "messi@test.com" });
    });

    it("SUPERTEST: Debe poder agregarse un usuario con la ruta /api/sessions/registro, metodo post", async () => {
      const usuarioPrueba = {
        first_name: "Lionel",
        last_name: "Messi",
        email: "messi@test.com",
        age: "36",
        password: "123",
        role: "user",
      };

      let { body } = await requester
        .post("/api/sessions/registro")
        .send(usuarioPrueba);

      expect(usuarioPrueba).to.have.property("email");
    });

    it("SUPERTEST: Debe poder hacerse un login siguiendo la ruta: /api/sessions/login", async () => {
      const usuarioPrueba = {
        email: "messi@test.com",
        password: "123",
      };

      let response = await requester
        .post("/api/sessions/login")
        .send(usuarioPrueba);

      expect(response.status).to.equal(302);

      expect(response.header["set-cookie"]).to.exist;

      cookie = response.header["set-cookie"][0];
    });
  });
}

runTests();
