import express from "express";
import cors from "cors";
import Auth from "./Routes/Auth.js";
import Group from "./Routes/Group.js";
import Friends from "./Routes/Friends.js";
import authMiddleware from "./Functions/authenticate.middleware.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import connectDB from "./Functions/connectDB.js";
import { retriveMessages, saveMessage } from "./Functions/Messages.js";
import { ExpressPeerServer } from "peer";
dotenv.config({ path: ".env.local" });

const mdbConnection = await connectDB();

const App = new express();

App.use(cors({ origin: "*" }));

App.use(express.json());
App.use(authMiddleware);
App.use("/auth", Auth);
App.use("/group", Group);
App.use("/friend", Friends);

const expServer = App.listen(
  process.env.SERVER_PORT,
  process.env.SERVER_HOST,
  () => {
    console.log(
      `\n*****Chatinger Server is started running on http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`
    );
  }
);

const videoServer = ExpressPeerServer(expServer, {
  path: "/",
  allow_discovery: true,
  debug: true
});
App.use("/video-call", videoServer);

// code to communicate with sockets
const io = new Server(expServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log(
    "\n*****server socket connection is established with = ",
    socket.id
  );

  socket.on("join_room", (data) => {
    console.log(data.room, " room joined by ", socket.id);
    socket.join(data.room);
  });

  socket.on("join_video_call", (data) => {
    console.log(data.room, " video joined by ", socket.id);
    socket.join(data.room);
    socket.to(data.room).emit("answer_video_call", {roomId: data.room})
  });

  socket.on("end_private_video_call", (data) => {
    console.log(data.room, " end video joined by ", socket.id);
    socket.leave(data.room);
    socket.to(data.room).emit("end_private_video_call", {roomId: data.room})
  });

  socket.on("messageToServer", (data) => {
    console.log(
      data.room,
      data.sent_by,
      " : Message received from client side : ",
      data.message,
      data.display_name
    );
    socket
      .to(data.room)
      .emit("messageToClient", {
        message: data.message,
        display_name: data.display_name,
      });
    saveMessage({
      text: data.message.trim("\n"),
      sent_by: data.sent_by,
      chatroom: data.room,
    });
  });

  socket.on("retriveMessages", (data) => {
    console.log("\n\n************************ retriveMessages = ", data);
    retriveMessages(data.payload)
      .then((res) => {
        io.in(data.room).emit("listMessages", res, () => {
          console.log("\n########## listMessages event emitted");
        });
      })
      .catch((error) => {
        console.log(data, "************* error while fetching messages", error);
      });
  });

  socket.on("leave_room", (data) => {
    console.log(data.room, " room closed by ", socket.id);
    socket.leave(data.room);
  });
});

io.on("close", () => {
  console.log("\n*******server socket disconnected");
});
