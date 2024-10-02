import { Router } from "express";
import connectDB from "../Functions/connectDB.js";
import User from "../models/User.js";
import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";

const Friends = new Router();

// add new friend and remove from friend
Friends.route("/")
  .post(async (req, res) => {})
  .delete(async (req, res) => {
    // ? To Remove Friend
    const { chatroom_id } = req.query;
    if (!chatroom_id) return res.json({ error: true });

    try {
      await connectDB();

      const deleteChatroom = await ChatRoom.deleteOne({ _id: chatroom_id });
      const deleteMessage = await Message.deleteMany({ chatroom: chatroom_id });

      console.log(deleteChatroom);
      console.log(deleteMessage);

      return res.json({ error: false });
    } catch (error) {
      console.log(error);
      return res.json({ error: true });
    }
  });

// ******************************************************************************************************************************************

Friends.route("/request")
  .post(async (req, res) => {
    const { requested_by } = req.body;

    await connectDB();

    try {
      const updatedUser = await User.updateOne(
        { _id: requested_by },
        { $push: { received_friend_requests: req.auth._id } }
      );
      console.log(updatedUser);
    } catch (error) {
      res.status(500).json({ error: true, message: "internal server error" });
    }
  })

  // ******************************************************************************************************************************************

  .patch(async (req, res) => {
    const { friend_id, status } = req.body;

    await connectDB();

    // firstly, remove firend id from received_friend_requests
    const removeRequest = await User.updateOne(
      { _id: req.auth._id },
      { $pull: { received_friend_requests: friend_id } }
    );

    // secondly, create private chantroom for both is accepted
    if (status === "accept") {
      const addChatRoom = await ChatRoom.insertMany([
        {
          type: "private",
          members: [req.auth._id, friend_id],
        },
      ]);
      console.log(addChatRoom);

      const newChatRoom = await ChatRoom.findOne({
        _id: addChatRoom[0]._id,
      }).populate({
        path: "members",
        model: "User",
        select: "username _id display_name",
      });
      console.log(newChatRoom);

      return res.json({ error: false, chatroom: newChatRoom });
    }

    return res.json({ error: false });
  })

  // ! API to revoke my sent friend request
  .delete(async (req, res) => {
    const { friend_id } = req.query;

    await connectDB();

    const removefriend = await User.updateOne(
      { _id: friend_id },
      { $pull: { received_friend_requests: req.auth._id } }
    );

    return res.json({ error: false });
  });

// ******************************************************************************************************************************************

Friends.get("/search_by_username/:username", async (req, res) => {
  const username = req.params.username;
  console.log(username);

  await connectDB();

  // TODO: i can mix these 2 queries using aggregation pipeline

  const privateChatrooms = await ChatRoom.find({
    type: "private",
    members: req.auth._id,
  });

  // Extract the other member's IDs
  const existingChatPartnerIds = privateChatrooms?.map((chatroom) =>
    chatroom.members.find(
      (memberId) => memberId.toString() !== req.auth._id.toString()
    )
  );

  const users = await User.find({
    username: { $regex: username, $options: "i" },
    _id: { $ne: req.auth._id, $nin: existingChatPartnerIds },
    received_friend_requests: { $nin: [req.auth._id] },
  }).select("_id username display_name");

  return res.json({ error: false, users: users });
});

Friends.delete("/clear_chats/:chatroom_id", async (req, res) => {
  const { chatroom_id } = req.params;

  await connectDB();

  try {
    const deleted = await Message.deleteMany({ chatroom: chatroom_id });

    return res.json({ error: false });
  } catch (error) {
    console.log(
      "\n **************** error happend while ckearing all messages ",
      error
    );
    return res.status(500).json({ error: true, message: error });
  }
});

export default Friends;
