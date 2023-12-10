import { WebSocketServer } from "ws";
import fs from "fs";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  const readStream = fs.createReadStream("./video.mp4");

  readStream.on("data", (chunk) => {
    console.log(chunk);
    // ws.send(Buffer.from(chunk));
    ws.send(chunk);
  });

    readStream.on("end", () => {
          ws.send("stream-completed");
  //     wss.close();
    });
});
