import { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 8080 });

server.on("connection", (socket, req) => {
  console.log("im connected from Websocket.js");
  // console.log(req); 

  socket.on("message", (message) => {
    console.log(message.toString());
    socket.send("hello world from Websocket.js >>>");
  });

  socket.on("close", () => {
    console.log("Connection has closed from Websocket.js");
  });
});

server.on("listening", (data) => {
  console.log("Searching for connection on port 8080");
});
