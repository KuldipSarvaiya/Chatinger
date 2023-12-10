import { createServer } from "node:http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = Server(httpServer);

io.on("connection", async (socket) => {
  console.log(socket.id, " : connected from socket server");
  const user = await fetchUser(socket);

// socket.join
  socket.on("message", (message) => {
    console.log(message);
    // socket.emit("message",;
    socket.emit("message", "i love you dhruvika");
  });
}); 
