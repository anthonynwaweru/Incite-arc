const users = [];

// remove user
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};
// add user
const addUser = ({ id, username, room }) => {
  // data cleaning
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // data validation
  if (!room || !username) {
    return {
      error: "Username and room name is required",
    };
  }

  // check if username is already taken
  const takenUsername = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // username validation
  if (takenUsername) {
    return {
      error: "Username already taken",
    };
  }

  const user = { id, username, room };
  users.push(user);

  return { user };
};

// get user function using user ID
const getUser = (id) => {
  const user = users.filter((user) => user.id === id);

  //   check if user exists
  if (user.length === 0) {
    return {
      error: "User not found",
    };
  }
  return { user };
};

// get all users in a room
const getUsersInRoom = (room) => {
  const usersInRoom = users.filter((user) => user.room === room);
  //   check if room has users
  if (usersInRoom.length === 0) {
    return {
      error: "No users in room",
    };
  }
  return usersInRoom;
};

module.exports = {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
};
