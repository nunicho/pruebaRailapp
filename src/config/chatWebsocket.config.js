const socketIO = require("socket.io");

function initializeSocketChat(serverExpress) {
  const serverSocketChat = socketIO(serverExpress);

  serverSocketChat.on("connection", (socket) => {
    console.log("Nuevo usuario conectado:", socket.id);

    socket.on("id", (nombre) => {
      console.log("Nuevo usuario:", nombre);

      const bienvenidaMessage = {
        emisor: "Server",
        mensaje: "Bienvenido al chat de ferretería el Tornillo... !!!",
      };
      socket.emit("bienvenida", [bienvenidaMessage]);
      socket.broadcast.emit("nuevoUsuario", nombre);
    });

    socket.on("nuevoMensaje", (mensaje) => {
      console.log("Nuevo mensaje:", mensaje);
      serverSocketChat.emit("llegoMensaje", mensaje);
    });

    socket.on("disconnect", () => {
      console.log("Usuario desconectado:", socket.id);
    });
  });

  return serverSocketChat;
}

module.exports = initializeSocketChat;
