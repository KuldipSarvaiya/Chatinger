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
    const msg = Message.find({ chatroom: chatroom_id })
      .populate({
        path: "sent_by",
        model: "User",
        select: "display_name",
      })
      .sort({ deliveredAt: 1 })
      .skip(skip || 0)
      .limit(take || 10)
      .select("_id text deliveredAt sent_by");
    const count = Message.countDocuments({ chatroom: chatroom_id });

    const [messages, totalMessages] = await Promise.all([msg, count]);
    console.log(totalMessages);

    return { messages, totalMessages, pagination: { skip, take } };
  } catch (error) {
    console.log(
      "\n\n ********************** Failed to retrive Message - ",
      error
    );
  }
}
