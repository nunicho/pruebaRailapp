// const mongoose = require("mongoose");
//const config = require("../src/config/config.js");
const chai = require("chai");
//const UsersMongoDao = require("../src/dao/usersMongoDao.js");
const { describe, it } = require("mocha");
const { generaHash, validaHash } = require("../src/util.js");

//mongoose.connect(config.MONGO_URL, { dbName: config.DB_NAME });


const expect=chai.expect

describe("CHAI: Pruebas funciones hash", async ()=>{
    //this.timeout(5000)

    it("CHAI: Si ejecuto generaHash enviando un password como argumento, genera un hash con algoritmo Bcrypt", async ()=>{
        let password="codercoder"
        let resultado=await generaHash(password)

        expect(resultado).not.to.be.equal(password)
        expect(resultado.length).to.be.greaterThan(10)
        expect(resultado.substring(0,4)).to.be.equal("$2b$")
    })

    it("CHAI: La funcion validaHash recibe usuario y password, verifica coincidencia", async ()=>{
        let password ="123"
        let usuario = {
            password: generaHash(password)
        }
        let resultado = await validaHash(usuario, password)

        expect(resultado).is.true
        expect(resultado).to.be.eq(true)

       resultado = await validaHash(usuario, "567");

        expect(resultado).is.false;
        expect(resultado).to.be.eq(false);
        
    })
})

