import mongoose from "mongoose";

let isConnected = false;

async function connectDB() {
  if (isConnected) return console.log("Mongodb Already Connect");

  if (!process.env.MONGODB_CONNECTION_URL) {
    console.log("MONGODB_CONNECTION_URL is Missing in .env.local file");
    process.exit(0);
  }

  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(process.env.MONGODB_CONNECTION_URL, {
      dbName: "chatinger",
      serverSelectionTimeoutMS: 10000
    });
    isConnected = true;
    console.log("\n***********Mongodb Connected\n");
    return conn
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

export default connectDB;
