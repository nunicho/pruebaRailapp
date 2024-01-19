const socketIO = require("socket.io");
const MessageModel = require("../dao/Mongo/models/messages.modelo.js");

const configureChat = (serverExpress) => {
  const serverSocket = socketIO(serverExpress);
  serverSocket.on("connection", (socket) => {});

  let mensajes = [
    {
      emisor: "Server",
      mensaje: "Bienvenido al chat de ferretería el Tornillo... !!!",
    },
  ];

  let usuarios = [];

  const serverSocketChat = socketIO(serverExpress);

  serverSocketChat.on("connection", (socket) => {
    socket.on("id", (nombre) => {
      usuarios.push({
        id: socket.id,
        nombre,
      });
      socket.emit("bienvenida", mensajes);
      socket.broadcast.emit("nuevoUsuario", nombre);
    });

    socket.on("nuevoMensaje", (mensaje) => {
      // Guarda el mensaje en MongoDB
      const newMessage = new MessageModel({
        user: mensaje.emisor,
        message: mensaje.mensaje,
      });

      newMessage.save().then(() => {});

      mensajes.push(mensaje);
      serverSocketChat.emit("llegoMensaje", mensaje);
    });

    // PARA HACER UN USUARIO QUE SE DESCONECTÓ
    socket.on("disconnect", () => {
      let indice = usuarios.findIndex((usuario) => usuario.id === socket.id);
      let usuario = usuarios[indice];
      serverSocketChat.emit("usuarioDesconectado", usuario);
      usuarios.splice(indice, 1);
    });
  });
};

module.exports = configureChat;
