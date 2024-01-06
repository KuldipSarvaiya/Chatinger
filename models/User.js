import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      minLength: 10,
      maxLength: 50,
      required: [true, "\n*****username has not provided\n"],
      lowercase: true,
      immutable: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "\n*****password has not provided\n"],
      immutable: true,
      minLength: [8, "\n******password must 8 characters long\n"],
    },
    display_name: {
      type: String,
      required: [true, "\n*****display name has not provided"],
      immutable: true,
      maxLength: 18,
    },
    email: {
      type: String,
      required: [true, "\n*****email has not provided"],
      immutable: true,
      unique: true,
    },
    jwt: {
      type: String,
      required: false,
      immutable: false,
      default: "default_JWT_Token",
    },
    received_friend_requests: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: false,
    },
    chatrooms: {
      type: [Schema.Types.ObjectId],
      ref: "ChatRoom",
      required: false,
    },
  },
  {
    timestamps: { createdAt: "joinedOn" },
  }
);

const User = mongoose.model("User", userSchema);
export default User;
