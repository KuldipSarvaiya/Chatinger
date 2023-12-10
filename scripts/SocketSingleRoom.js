import { createServer } from "node:http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", async (socket) => {
  console.log(socket.id, " : connected from socket server");

  socket.join("first_room");
  socket.to("first_room").emit("message", `Server : ${socket.id} has joined room`);
  //   socket.broadcast.emit("message", `Server : ${socket.id} has joined room`);

  socket.on("message", (message) => {
    console.log(socket.id, message);
    //     socket.broadcast.emit("message", `${socket.id} : ${message}`);
    socket.to("first_room").emit("message", `${socket.id} : ${message}`);
  });
});

httpServer.listen(8080, () => {
  console.log("Searching on port 8080");
});
