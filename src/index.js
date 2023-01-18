const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessageandTimestamp,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const publicDirectories = path.join(__dirname, "../public");

app.use(express.static(publicDirectories));

io.on("connection", (socket) => {
  console.log("websocket connection made to the server");

  // user joining room
  socket.on("join", (options, callBack) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callBack(error);
    }

    socket.join(user.room);
    socket.emit(
      "message",
      generateMessageandTimestamp("Admin", `Welcome to ${user.room} chat room`)
    );
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessageandTimestamp(
          "Admin",
          `${user.username} has joined the chat`
        )
      );
    io.to(user.room).emit("userData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });

  // new message
  socket.on("newMessage", (newMessage, callBack) => {
    const { user } = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(newMessage)) {
      return callBack("Profanity is not allowed");
    }
    io.to(user[0].room).emit(
      "message",
      generateMessageandTimestamp(user[0].username, newMessage)
    );
    callBack();
  });

  // user sending location
  socket.on("sendLocation", ({ lat, lon }, callBack) => {
    const { user } = getUser(socket.id);
    console.log(user[0].username);
    io.to(user[0].room).emit(
      "location",
      generateLocationMessage(
        user[0].username,
        `https://google.com/maps?q=${lat},${lon}`
      )
    );
    callBack();
  });

  // user disconnect
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    console.log(user);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessageandTimestamp(
          "Admin",
          `${user.username} has left the chat room`
        )
      );
      io.to(user.room).emit("userData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
