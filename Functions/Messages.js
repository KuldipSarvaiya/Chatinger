import Message from "../models/Message.js";
import connectDB from "./connectDB.js";

export async function saveMessage(data) {
  await connectDB();

  try {
    const msg = await Message.insertMany([data]);
    console.log(msg);
  } catch (error) {
    console.log("\n\n ********************** Failed to save Message - ", data);
    console.log(error);
  }
}

export async function retriveMessages({ chatroom_id, skip, take }) {
  await connectDB();

  try {
    const msg = await Message.find({ chatroom: chatroom_id })
      .populate({
        path: "sent_by",
        model: "User",
        select: "username",
      })
      .sort({ deliveredAt: 1 })
      .skip(skip || 0)
      .limit(take || 100).select("_id text deliveredAt sent_by");

    return msg;
  } catch (error) {
    console.log(
      "\n\n ********************** Failed to retrive Message - ",
      error
    );
  }
}
