import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      minLength: 5,
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
    received_friend_requests: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: false,
    }
  },
  {
    timestamps: { createdAt: "joinedOn" },
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
