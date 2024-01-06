import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import Auth from "./Routes/Auth.js";
import Group from "./Routes/Group.js";
import Friends from "./Routes/Friends.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Server } from "socket.io";
dotenv.config({ path: ".env.local" });

const mdbConnection = await mongoose
  .connect(process.env.MONGODB_CONNECTION_URL, {
    dbName: "chatinger",
  })
  .then(() => {
    console.log("\n******mongodb connected");
  })
  .catch((e) => {
    console.log("\n******mongodb connection failed due to = ", e);
  });

const App = new express();

App.use(express.json());
App.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));

// *****authenticating user for further access of server endpoints*****
// App.use((req, res, next) => {
//   console.log("\n******authenticate api request");
//   console.log(req.headers);

//   const [bearer, jwt] = req.headers.authorization.split(" ");

//   //unauthorized access
//   if (bearer !== "bearer" || jwt === undefined || jwt === null) {
//     res.status(401);
//     return;
//   }

//   // if user is signing in or up
//   if (req.url.startsWith("/auth")) next();

//   jwt.verify(jwt, process.env.JWT_PRIVATE_KEY, (err, data) => {
//     if (err) {
//       res.status(401);
//       return;
//     }
//     req.auth = data;
//   });

//   next();
// });

// App.use((req, res, next) => {
//   console.log("\n*****set analytics");
//   next();
// });

// Importing the routes
App.use("/auth", Auth);
App.use("/group", Group);
App.use("/friend", Friends);

// get request on home send usesr according to req.auth
App.get("/", (req, res) => {
  console.log("get request oon home page");
  res.send("get request oon home page");
});

const expServer = App.listen(
  process.env.SERVER_PORT,
  process.env.SERVER_IP,
  () => {
    console.log(
      `\n*****Chatinger Server is started running on http://${process.env.SERVER_IP}:${process.env.SERVER_PORT}`
    );
  }
);

//
//
// code to communicate with sockets
const io = new Server(expServer, {
  cors: { origin: ["http://localhost:5173", "http://127.0.0.1:5173"] },
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
    console.log(socket.id," : Message received from client side : ", data.message);
    socket.broadcast.to(data.room).emit("messageToClient", data.message);
  });
  
  socket.on("leave_room", (room) => {
    console.log(room.room, " room closed by ", socket.id);
    socket.leave(room.room);
  });
});

io.on("close", () => {
  console.log("\n*******server socket disconnected");
});

//
//
