const handlebars = require("express-handlebars");

const configureHandlebars = () => {
  return handlebars.create({
    helpers: {
      add: function (value, addition) {
        return value + addition;
      },
      subtract: function (value, subtraction) {
        return value - subtraction;
      },
      ifEquals: function (arg1, arg2, options) {
        return arg1 === arg2 ? options.fn(this) : options.inverse(this);
      },
      json: function (context) {
        return JSON.stringify(context);
      },
      fileRead: function (filePath, options) {
        fs.readFile(filePath, "utf-8", (error, data) => {
          if (error) {
            console.error(
              `Error al leer el archivo ${filePath}: ${error.message}`
            );
            if (options && options.fn) {
              options.fn("Error al leer el archivo");
            }
          } else {
            if (options && options.fn) {
              options.fn(data);
            }
          }
        });
      },
      compareOwners: function (owner1, owner2, options) {
        if (owner1 === owner2) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      },
    },
  });
};

module.exports = configureHandlebars;
