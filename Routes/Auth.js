import { Router } from "express";
import User from "../models/User.js";
import sendMail from "../Functions/sendMail.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const Auth = new Router();

// sigin for old users
Auth.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  try {
    // search user for given exact username and password in mongodb
    const findUser = await User.findOne({
      username: username,
      password: password,
    }).populate("chatrooms");

    console.log(findUser);
    if (findUser === null) res.json({ error: true, type: 404 });

    const OTP = Math.floor(Math.random(1) * 900000 + 100000);
    sendMail("kuldipsarvaiya94@gmail.com", OTP);

    res.json({ error: false, otp: OTP, user: findUser });
  } catch (error) {
    console.log("\n*******Error in siging in user = ", error);
    res.json({ error: true, type: 500 });
  }
});

// a new user signup request, creating JWT token and sending OTP for email verification
Auth.post("/signup", async (req, res) => {
  // const { display_name, username, email, password } = req.body;

  console.log(req.body);

  try {
    // check if user with same username or email does not exist
    const doesExist = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }],
    });
    if (doesExist !== null) {
      res.json({ error: true, type: "duplication" });
      return;
    }
    // creating JWT token for auth
    const jwtToken = jwt.sign({ ...req.body }, process.env.JWT_PRIVATE_KEY);
    const OTP = Math.floor(Math.random(1) * 900000 + 100000);
    // email otp sending fun. this is async
    // but if i make it await then it will be cause long time to responde to request
    sendMail(req.body.email, OTP);

    res.json({ error: false, jwt: jwtToken, otp: OTP });
  } catch (error) {
    // error handling part
    console.log("\n******Error in verification for signup = ", error);
    res.json({
      error: true,
      message: "Faild to send OTP, Email may not exist",
      type: 500,
    });
  }
});

// finally after verifying email we are creating an account of user in mongodb
Auth.post("/register", async (req, res) => {
  console.log(req.body);
  try {
    // creating new user with verified email and jwt token
    const newUser = new User({ ...req.body });
    await newUser.save();

    res.json({ error: false, user: newUser });
  } catch (error) {
    // error handling part
    console.log("\n*******Error in creating new user = ", error);
    res.json({
      error: true,
      message: "failed to create user, create an account again",
      type: 500,
    });
  }
});

export default Auth;
