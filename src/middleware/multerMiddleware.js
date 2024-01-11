const multer = require("multer");

const storageDocuments = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/documents");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const storageProducts = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/products");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()+ "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const storageProfiles = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/profiles");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const storageIdentificacion = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/docPremium");
  },
  filename: function (req, file, cb) {
    const nombre = req.body.nombre || "DNI"; // Valor por defecto si no se proporciona el nombre
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${nombre}-${uniqueSuffix}-${file.originalname}`);
  },
});

const storageDomicilio = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/docPremium");
  },
  filename: function (req, file, cb) {
    const nombre = "DOMICILIO";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${nombre}-${uniqueSuffix}-${file.originalname}`);
  },
});

const storageCuenta = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/docPremium");
  },
  filename: function (req, file, cb) {
    const nombre = "CUENTA";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${nombre}-${uniqueSuffix}-${file.originalname}`);
  },
});

const uploadDocuments = multer({ storage: storageDocuments });
const uploadProducts = multer({ storage: storageProducts });
const uploadProfiles = multer({ storage: storageProfiles });

const uploadIdentificacion = multer({ storage: storageIdentificacion });
const uploadDomicilio = multer({ storage: storageDomicilio });
const uploadCuenta = multer({ storage: storageCuenta });

module.exports = {
  uploadDocuments,
  uploadProducts,
  uploadProfiles,
  uploadIdentificacion,
  uploadDomicilio,
  uploadCuenta
};
