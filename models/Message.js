import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      immutable: true,
      minLength: 1,
    },
    sent_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      immutable: true,
    },
    //   sent_to:{
    //     type: Schema.Types.User,
    //     immutable:true,
    //   },
    chatroom: {
      type: Schema.Types.ObjectId,
      ref: "ChatRoom",
      immutable: true,
    },
  },
  {
    timestamps: { createdAt: "deliveredAt" },
  }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
