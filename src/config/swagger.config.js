const swagger_jsdoc = require("swagger-jsdoc");

const configureSwagger = () => {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Ecommerce Retro Gamer",
        version: "1.0.0",
        description:
          "Documentación del proyecto: productos y carritos de compra",
      },
    },
    apis: ["./docs/*.yaml"],
  };

  return swagger_jsdoc(options);
};

module.exports = configureSwagger;
