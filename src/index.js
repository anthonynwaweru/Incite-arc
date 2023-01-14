const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessageandTimestamp } = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const publicDirectories = path.join(__dirname, "../public");

app.use(express.static(publicDirectories));

io.on("connection", (socket) => {
  console.log("websocket connection made to the server");

  socket.emit("message", generateMessageandTimestamp("welcome"));
  socket.broadcast.emit(
    "message",
    generateMessageandTimestamp("new user has joined the chat")
  );
  socket.on("newMessage", (newMessage, callBack) => {
    const filter = new Filter();
    if (filter.isProfane(newMessage)) {
      return callBack("Profanity is not allowed");
    }
    io.emit("message", generateMessageandTimestamp(newMessage));
    callBack();
  });

  socket.on("sendLocation", ({ lat, lon }, callBack) => {
    io.emit("location", `https://google.com/maps?q=${lat},${lon}`);
    callBack();
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMessageandTimestamp("User has left the chat"));
  });
});

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
