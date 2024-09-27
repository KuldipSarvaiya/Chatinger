import User from "../models/User.js";
import connectDB from "./connectDB.js";

export async function fetchUserProfile(searchProp) {
  await connectDB();  

  try {
    const user = await User.aggregate([
      {
        $match: searchProp,
      },
      {
        $lookup: {
          from: "chatrooms",
          localField: "_id",
          foreignField: "members",
          as: "chatrooms",
          pipeline: [
            {
              $project: {
                _id: 1,
                display_name: 1,
                members: 1,
                admin: 1,
                type: 1
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "received_friend_requests",
          foreignField: "_id",
          as: "received_friend_requests",
        },
      },
      {
        $unwind: {
          path: "$chatrooms",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          let: {
            members: { $ifNull: ["$chatrooms.members", []] },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$members"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                username: 1,
                display_name: 1,
                admin: 1,
              },
            },
          ],
          as: "chatrooms.members",
        },
      },
      {
        $group: {
          _id: "$_id",
          username: {
            $first: "$username",
          },
          display_name: {
            $first: "$display_name",
          },
          chatrooms: {
            $push: "$chatrooms",
          },
          received_friend_requests: {
            $first: "$received_friend_requests",
          },
        },
      },
    ]);

    return user;
  } catch (err) {
    console.log(err);

    return null;
  }
}
