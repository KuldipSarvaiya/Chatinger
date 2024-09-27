import express from "express";
import cors from "cors";
import Auth from "./Routes/Auth.js";
import Group from "./Routes/Group.js";
import Friends from "./Routes/Friends.js";
import authMiddleware from "./Functions/authenticate.middleware.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import connectDB from "./Functions/connectDB.js";
dotenv.config({ path: ".env.local" });

const mdbConnection = await connectDB();

const App = new express();

App.use(
  cors({ origin: "*" })
);

App.use(express.json());
App.use(authMiddleware);
App.use("/auth", Auth);
App.use("/group", Group);
App.use("/friend", Friends);

const expServer = App.listen(
  process.env.SERVER_PORT,
  process.env.SERVER_IP,
  () => {
    console.log(
      `\n*****Chatinger Server is started running on http://${process.env.SERVER_IP}:${process.env.SERVER_PORT}`
    );
  }
);

// code to communicate with sockets
const io = new Server(expServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log(
    "\n*****server socket connection is established with = ",
    socket.id
  );

  socket.on("join_room", (room) => {
    console.log(room.room, " room joined by ", socket.id);
    socket.join(room.room);
  });

  socket.on("messageToServer", (data) => {
    console.log(
      socket.id,
      " : Message received from client side : ",
      data.message
    );
    socket.to(data.room).emit("messageToClient", data.message);
  });

  socket.on("leave_room", (room) => {
    console.log(room.room, " room closed by ", socket.id);
    socket.leave(room.room);
  });
});

io.on("close", () => {
  console.log("\n*******server socket disconnected");
});
