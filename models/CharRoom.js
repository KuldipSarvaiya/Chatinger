import mongoose, { Schema } from "mongoose";

const chatroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    default: null,
  },
  members: {
    type: [Schema.Types.ObjectId],
    ref: "User",
    required: [true, "\n********please set member of chatroom properly\n"],
  },
  type: {
    type: String,
    enum: {
      values: ["private", "group"],
      message: "\n*******type of chatroom must either private or group\n",
    },
    required: [true, "\n*******please specify the typr of chatroom\n"],
  },
});

const ChatRoom = mongoose.model("ChatRoom", chatroomSchema);
export default ChatRoom;
