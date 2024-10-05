import { Router } from "express";
import connectDB from "../Functions/connectDB.js";
import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";

const Group = new Router();

// create new group
Group.post("/", async (req, res) => {
  const { group_name } = req.body;

  await connectDB();

  try {
    const group = await ChatRoom.insertMany([
      {
        display_name: group_name,
        members: [req.auth._id],
        type: "group",
        admin: req.auth._id,
      },
    ]);
    console.log(group);

    return res.status(200).json({ error: false, chatroom: group });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: error });
  }
});

// add & remove member from group
Group.route("/members")
  .get(async (req, res) => {
    // ? to get member list to invite in group

    const { chatroom_id } = req.query;

    try {
      const result = await ChatRoom.aggregate([
        {
          $match: {
            members: { $in: [new mongoose.Types.ObjectId(req.auth._id)] },
          },
        },
        { $project: { members: 1, _id: 0 } },
        { $unwind: "$members" },
        {
          $group: {
            _id: null,
            user_ids: { $addToSet: "$members" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user_ids",
            foreignField: "_id",
            as: "friends",
            pipeline: [
              {
                $match: {
                  _id: { $nin: [new mongoose.Types.ObjectId(req.auth._id)] },
                },
              },
              {
                $project: {
                  _id: 1,
                  username: 1,
                  display_name: 1,
                },
              },
            ],
          },
        },
        { $project: { friends: 1, _id: 0 } },
        {
          $lookup: {
            from: "chatrooms",
            let: { friends: "$friends" },
            pipeline: [
              { $match: { _id: new mongoose.Types.ObjectId(chatroom_id) } },
              { $project: { members: 1 } },
            ],
            as: "chatroom",
          },
        },
        {
          $project: {
            friends: {
              $filter: {
                input: "$friends",
                as: "friend",
                cond: {
                  $not: {
                    $in: [
                      "$$friend._id",
                      { $arrayElemAt: ["$chatroom.members", 0] },
                    ],
                  },
                },
              },
            },
          },
        },
      ]);
      console.log(result);
      return res
        .status(200)
        .json({ error: false, members: result?.[0]?.friends || [] });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: true, message: error });
    }
  })
  .put(async (req, res) => {
    const { member_id, operation_type, chatroom_id } = req.body;
    console.log(member_id);

    let query = { $push: { members: member_id } };
    if (operation_type === "remove") query = { $pull: { members: member_id } };

    try {
      const result = await ChatRoom.updateOne({ _id: chatroom_id }, query);
      console.log(result);
      if (result.acknowledged)
        return res
          .status(200)
          .json({ error: false, message: "operation done" });
      else
        return res
          .status(403)
          .json({ error: true, message: "Failed to Change Membershi[" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: true, message: error });
    }
  });

// * delete whole group - not in use, insted FE uses remove Friend API
Group.delete("/:group_id", async (req, res) => {
  const { group_id } = req.params;

  await connectDB();

  try {
    const deleteRoom = ChatRoom.deleteOne({
      _id: group_id,
      admin: req.auth._id,
    });
    const deleteMsg = Message.deleteMany({ chatroom: group_id });

    const [roomDeleted, msgDeleted] = await Promise.all([
      deleteRoom,
      deleteMsg,
    ]);
    console.log(roomDeleted, msgDeleted);

    if (roomDeleted.deletedCount === 0) {
      return res.status(404).json({
        error: true,
        message: "Group not found or you're not the admin",
      });
    }

    return res
      .status(200)
      .json({ error: false, message: "Group deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: error.message });
  }
});

export default Group;
