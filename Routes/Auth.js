import { Router } from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import connectDB from "../Functions/connectDB.js";
import { fetchUserProfile } from "../Functions/profile.js";
import mongoose from "mongoose";
dotenv.config({ path: ".env.local" });

const Auth = new Router();

Auth.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  console.log(req.body);
  try {
    const findUser = await fetchUserProfile({ username, password });

    console.log(findUser);
    if (!findUser?.length)
      return res.status(401).json({ error: true, type: 401 });

    const jwtToken = jwt.sign(findUser[0], process.env.JWT_PRIVATE_KEY, {
      algorithm: "HS256",
    });

    res.json({ error: false, jwt: jwtToken, user: findUser[0] });
  } catch (error) {
    console.log("\n*******Error in siging in user = ", error);
    res.status(500).json({ error: true, type: 500 });
  }
});

// ******************************************************************************************************************************************

Auth.post("/signup", async (req, res) => {
  const { username } = req.body;

  await connectDB();

  try {
    const doesExist = await User.findOne({
      username: username,
    }).countDocuments();

    if (+doesExist !== 0) {
      res.json({ error: true, type: "duplication" });
      return;
    }

    const newUser = new User(req.body);
    await newUser.save();
    console.log(newUser);

    const jwtToken = jwt.sign(newUser, process.env.JWT_PRIVATE_KEY, {
      algorithm: "HS256",
    });

    res.json({ error: false, jwt: jwtToken, user: newUser });
  } catch (error) {
    console.log("\n*******Error in creating new user = ", error);
    res.json({
      error: true,
      message: "failed to create user, signup again",
      type: 500,
    });
  }
});

// ******************************************************************************************************************************************

Auth.get("/profile", async (req, res) => {
  console.log("get it from profile = ", req.auth._id);

  const user = await fetchUserProfile({
    _id: new mongoose.Types.ObjectId(req.auth._id),
  });
  console.log(user);

  if (user?.length === 1) return res.json({ error: false, user: user?.[0] });
  else {
    console.log("user not found");
    res.status(401).json({ error: true, type: 401 });
  }
});

export default Auth;
