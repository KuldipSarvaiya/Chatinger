import { Router } from "express";

const Group = new Router();

// create new group
Group.post("/create", async (req, res) => {});

// add new member to group
Group.put("/add_member", async (req, res) => {});

// remove member from group
Group.patch("/remove_member/:member_id", async (req, res) => {
  const member_id = req.params.member_id;
  console.log(member_id);
});

// delete whole group
Group.delete("/delete", async (req, res) => {});

export default Group;
