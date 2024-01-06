import { Router } from "express";
import addFriend from "../Functions/addFriend.js";

const Friends = new Router();

// add new friend and remove from friend
Friends.route("/")
  .post(async (req, res) => {
    addFriend(req.auth, { _id: "new_friend_details" });
  })
  .delete(async (req, res) => {});

// friend request accept and delete
Friends.route("/request")
  .post(async (req, res) => {
    addFriend(req.auth, { _id: "new_friend_details" });
  })
  .delete(async (req, res) => {});

// search friend by username
Friends.get("/search_by_username/:username", async (req, res) => {
  const username = req.params.username;
  console.log(username);
});

export default Friends;
