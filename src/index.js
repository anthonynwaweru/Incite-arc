const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const publicDirectories = path.join(__dirname, "../public");

app.use(express.static(publicDirectories));

io.on("connection", (socket) => {
  console.log("websocket connection made to the server");

  socket.emit("message", "Welcome!!!");
  socket.broadcast.emit("message", "new user has joined the chat");
  socket.on("newMessage", (newMessage) => {
    io.emit("message", newMessage);
  });

  socket.on("sendLocation", ({ lat, lon }) => {
    socket.emit("location", `https://google.com/maps?q=${lat},${lon}`);
  });

  socket.on("disconnect", () => {
    io.emit("message", "User has disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
