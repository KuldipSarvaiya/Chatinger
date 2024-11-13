import express from "express";
import cors from "cors";
import Auth from "./Routes/Auth.js";
import Group from "./Routes/Group.js";
import Friends from "./Routes/Friends.js";
import authMiddleware from "./Functions/authenticate.middleware.js";
import { Server } from "socket.io";
import connectDB from "./Functions/connectDB.js";
import { retriveMessages, saveMessage } from "./Functions/Messages.js";
import { ExpressPeerServer } from "peer";
import ActiveUsersManager from "./Functions/random_video_call.js";

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

const usersManager = new ActiveUsersManager();

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
    socket
      .to(data.room)
      .emit("answer_video_call", { roomId: data.room, ...data });
  });

  socket.on("end_private_video_call", (data) => {
    console.log(data.room, " end video joined by ", socket.id);
    socket.leave(data.room);
    socket.to(data.room).emit("end_private_video_call", { roomId: data.room });
  });

  socket.on("messageToServer", (data) => {
    socket.to(data.room).emit("messageToClient", {
      room: data.room,
      message: data.message,
      display_name: data.display_name,
    });

    if (data?.do_not_send_message !== "yes")
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

  // --//--/--/--/--/--/--/--/ random video call /--/--/--/--/--/--/--//--
  socket.on("join_random_video_call", (peerId) => {
    usersManager.addUser(socket.id, peerId);

    io.emit("userCounts", {
      active: usersManager.getActiveUsersCount(),
      waiting: usersManager.getWaitingUsersCount(),
    });
  });

  socket.on("findMatch", () => {
    console.log("findMatch");
    const matchedSocketId = usersManager.findMatch(socket.id);
    console.log("matchedSocketId = ", matchedSocketId);

    if (matchedSocketId) {
      const room = usersManager.createRoom(socket.id, matchedSocketId);
      console.log("room = ", room);

      if (room) {
        // Notify both users
        io.to(socket.id).emit("matchFound", {
          roomId: room.roomId,
          remotePeerId: room.user2.peerId,
        });

        io.to(matchedSocketId).emit("matchFound", {
          roomId: room.roomId,
          remotePeerId: room.user1.peerId,
        });
      }
    }
  });

  socket.on("callEnded", () => {
    usersManager.makeUserAvailable(socket.id);

    io.emit("userCounts", {
      active: usersManager.getActiveUsersCount(),
      waiting: usersManager.getWaitingUsersCount(),
    });
  });

  socket.on("disconnect_rvc", () => {
    console.log("disconnect_rvc");

    const roomId = usersManager.removeUser(socket.id);

    if (roomId) {
      // Notify other users in the room
      io.to(roomId).emit("userDisconnected");
    }

    io.emit("userCounts", {
      active: usersManager.getActiveUsersCount(),
      waiting: usersManager.getWaitingUsersCount(),
    });
  });
});

io.on("close", () => {
  console.log("\n*******server socket disconnected");
});
