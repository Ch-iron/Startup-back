const app = require('./app');
const httpServer = require("http").createServer(app);
const io = require('socket.io')(httpServer);

//소켓 클래스
class Socket {
  connection = (client) => {
    client.on("disconnect room", () => {
      console.log(`socket ${client.id} disconnected`);
    });
    client.on("join room", (room) => {
      console.log(`Socket ${client.id} joining ${room}`);
      client.join(room);
    });
    client.on("new message", (data) => {
      const { message, room } = data;
      console.log(`msg : ${message}, room: ${room}`);
      io.to(room).emit("new message", message);
    });
  };
}

const socket = new Socket();
io.on("connection", socket.connection);

httpServer.listen(3001, () => {
  console.log("ServerSide Socket Open!!!!!");
});
