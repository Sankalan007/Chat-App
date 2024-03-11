const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const dotenv = require("dotenv").config();

const app = express();
app.use(cors());
const server = http.Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: [
      "http://localhost:4200",
      "http://192.1.150.239:4200",
      "http://192.168.251.84:4200",
    ],
  },
});

const hostname = process.env.HOSTNAME || "localhost";
const port = process.env.PORT || 3000;

let rooms = [];
let users = [];
let messages = [];

function generateUserId() {
  const uuid = uuidv4().replace(/-/g, "");
  return uuid.substring(0, 8);
}

function generateRoomId() {
  const uuid = uuidv4().replace(/-/g, "");
  return uuid.substring(0, 12);
}

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.error("Address already in use, retrying in a few seconds...");
    setTimeout(() => {
      server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
      });
    }, 5000);
  }
});

function handleLogin(socket, userData) {
  const existingUserIndex = users.findIndex(
    (user) => user.username === userData.username
  );
  if (existingUserIndex === -1) {
    userData.userId = generateUserId();
    userData.onlineStatus = true;
    userData.socketId = socket.id;
    users.push(userData);
    socket.emit("login", userData);
  } else {
    const existingUser = users[existingUserIndex];
    existingUser.socketId = socket.id;
    existingUser.onlineStatus = true;
    socket.emit("login", existingUser);
  }
  io.emit("logged-in-users", users);
}

function handleDisconnect(socket) {
  const disconnectedUserIndex = users.findIndex(
    (user) => user.socketId === socket.id
  );
  if (disconnectedUserIndex !== -1) {
    users[disconnectedUserIndex].onlineStatus = false;
    io.emit("logged-in-users", users);
  }
}

function handleUpdateCurrentRoomId(currentUserId, userIdToChat) {
  const idx = rooms.findIndex(
    (room) => !room.isGroup && isP2PUsers(room, currentUserId, userIdToChat)
  );

  if (idx == -1) {
    const newRoom = {
      roomId: generateRoomId(),
      name: "",
      createdAt: new Date(),
      isGroup: false,
      members: [],
      messages: [],
    };

    currentUser = users.find((user) => user.userId == currentUserId);
    userToChat = users.find((user) => user.userId == userIdToChat);

    newRoom.name = `${currentUser.username}-${userIdToChat.username}`;

    newRoom.members.push(currentUser);
    newRoom.members.push(userIdToChat);

    rooms.push(newRoom);
    io.emit("update-room-id", newRoom);
  } else {
    io.emit("update-room-id", rooms[idx]);
  }
}

function isP2PUsers(room, currentUserId, userIdToChat) {
  if (room.members.length == 2) {
    return (
      (room.members[0].userId == currentUserId &&
        room.members[1].userId == userIdToChat) ||
      (room.members[1].userId == currentUserId &&
        room.members[0].userId == userIdToChat)
    );
  }
  return false;
}

function updateUser(user){
  const existingUserIndex = users.findIndex(
    (user) => user.userId === user.userId
  );
  if (existingUserIndex!== -1) {
    users[existingUserIndex] = user;
  }
}

io.on("connection", (socket) => {
  console.log("a user connected with socket id: " + socket.id);
  socket.on("login", (userData) => {
    handleLogin(socket, userData);
  });

  socket.on("disconnect", () => {
    console.log(`user with socket id: ${socket.id} disconnected`);
    handleDisconnect(socket);
  });

  socket.on('update-user', (user) => {
    updateUser(user);
    io.emit("update-user");
  })

  socket.on("update-current-room-id", (currentUserId, userIdToChat) => {
    handleUpdateCurrentRoomId(currentUserId, userIdToChat);
  });
});

app.get("/users", (req, res) => {
  res.json(users);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
