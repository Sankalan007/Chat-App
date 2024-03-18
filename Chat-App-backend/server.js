const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const dotenv = require("dotenv").config();

// Kafka configs

const { Kafka } = require("kafkajs");
const { Partitioners } = require("kafkajs");

const kafka = new Kafka({
  clientId: "chat-app",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});
const consumer = kafka.consumer({ groupId: "my-group" });

const run = async () => {
  await producer.connect();
  await consumer.connect();
};

const admin = kafka.admin();

const createTopic = async (topicName) => {
  try {
    await admin.connect();

    const existingTopics = await admin.listTopics();
    if (existingTopics.includes(topicName)) {
      return;
    }

    await admin.createTopics({
      topics: [
        {
          topic: topicName,
          numPartitions: 3,
          replicationFactor: 1,
        },
      ],
    });

    console.log("Topic created successfully");
  } catch (error) {
    console.error("Error creating topic:", error);
  } finally {
    await admin.disconnect();
  }
};

async function listTopics() {
  await admin.connect();
  const topics = await admin.listTopics();
  console.log("Topics:", topics);
  await admin.disconnect();
}

const sendMessage = async (topic, message) => {
  console.log(`Message send to ${topic}:`, message);
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
};

const subscribeToTopic = async (topic) => {
  await consumer.subscribe({ topic });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        value: message.value.toString(),
      });
    },
  });
};

run().catch(console.error);
createTopic("login-events").catch(console.error);
// listTopics().catch(console.error);

// Kafka configs end here

const app = express();
app.use(cors());
const server = http.Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: [
      "http://localhost:4200",
      "http://192.1.150.239:4200",
      "http://192.168.84.84:4200",
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

function generateMessageId() {
  const uuid = uuidv4();
  return uuid;
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
    userData.currentRoomId = null;
    users.push(userData);
    socket.emit("login", userData);
  } else {
    const existingUser = users[existingUserIndex];
    existingUser.socketId = socket.id;
    existingUser.onlineStatus = true;
    existingUser.currentRoomId = null;
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
    users[disconnectedUserIndex].currentRoomId = null;
    io.emit("logged-in-users", users);
  }
  distinctPrint("Users: ", users);
}

function handleP2PCurrentRoomId(socket, currentUserId, userIdToChat) {
  const idx = rooms.findIndex(
    (room) => !room.isGroup && isP2PUsers(room, currentUserId, userIdToChat)
  );

  const newRoomId = generateRoomId();

  if (idx == -1) {
    const newRoom = {
      roomId: newRoomId,
      name: "",
      description: "",
      createdAt: new Date(),
      isGroup: false,
      members: [],
      messages: [],
    };

    let currentUser = users.find((user) => user.userId == currentUserId);
    let userToChat = users.find((user) => user.userId == userIdToChat);

    currentUser.currentRoomId = newRoomId;

    newRoom.name = `${currentUser.username}-${userToChat.username}`;

    newRoom.members.push(currentUser);
    newRoom.members.push(userToChat);

    rooms.push(newRoom);
    socket.emit("update-current-room-id", newRoom);
  } else {
    let currentUser = users.find((user) => user.userId == currentUserId);
    currentUser.currentRoomId = rooms[idx].roomId;
    socket.emit("update-current-room-id", rooms[idx]);
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

function updateUser(userToUpdate) {
  const existingUserIndex = users.findIndex(
    (user) => user.userId === userToUpdate.userId
  );
  if (existingUserIndex !== -1) {
    users[existingUserIndex] = userToUpdate;
  }
  io.emit("update-user", userToUpdate);
}

function getRoomInfo(socket, roomId) {
  const room = rooms.find((r) => {
    return r.roomId === roomId;
  });
  socket.emit("get-room-info", room);
}

function handleMessages(socket, senderId, roomId, content, isRead) {
  const room = rooms.find((r) => {
    return r.roomId === roomId;
  });

  const sender = users.find((u) => {
    return u.userId === senderId;
  });

  const message = {
    messageId: generateMessageId(),
    senderId,
    senderName: sender.username,
    roomId,
    content,
    createdAt: new Date(),
    isRead,
  };

  room.messages.push(message);

  if (sender.currentRoomId != null) {
    distinctPrint("currentRoomId: ", sender.currentRoomId);
    io.to(sender.currentRoomId).emit("message", message);
  }
}

function distinctPrint(caption, object) {
  console.log(
    "\n\n\n\n\n\n\n\n<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
  );
  console.log(caption, object);
  console.log(
    "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n\n\n\n\n\n\n\n"
  );
}

io.on("connection", (socket) => {
  console.log("a user connected with socket id: " + socket.id);

  socket.on("login", (userData) => {
    handleLogin(socket, userData);
    sendMessage("login-events", userData);
  });

  socket.on("disconnect", () => {
    console.log(`user with socket id: ${socket.id} disconnected`);
    handleDisconnect(socket);
  });

  socket.on("join", (roomId) => {
    socket.join(roomId);
  });

  socket.on("update-user", (user) => {
    updateUser(user);
  });

  socket.on("update-current-room-id", ({ currentUserId, userIdToChat }) => {
    handleP2PCurrentRoomId(socket, currentUserId, userIdToChat);
  });

  socket.on("get-room-info", (roomId) => {
    distinctPrint("Users: ", users);
    getRoomInfo(socket, roomId);
  });

  socket.on("message", ({ senderId, roomId, content, isRead }) => {
    distinctPrint("Users: ", users);
    handleMessages(socket, senderId, roomId, content, isRead);
  });
});

app.get("/users", (req, res) => {
  res.json(users);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});



// const express = require("express");
// const cors = require("cors");
// const http = require("http");
// const dotenv = require("dotenv").config();
// // Kafka configs
// const { Kafka } = require("kafkajs");
// const { Partitioners } = require("kafkajs");
// const { getRoomInfo, handleP2PCurrentRoomId } = require("./handlers/room");
// const { handleLogin, handleDisconnect } = require("./handlers/auth");
// const { handleMessages } = require("./handlers/messages");
// const { distinctPrint } = require("./common");
// const { updateUser } = require("./handlers/users");
// const kafka = new Kafka({
//   clientId: "chat-app",
//   brokers: ["localhost:9092"],
// });
// const producer = kafka.producer({
//   createPartitioner: Partitioners.LegacyPartitioner,
// });
// const consumer = kafka.consumer({ groupId: "my-group" });
// const run = async () => {
//   await producer.connect();
//   await consumer.connect();
// };
// const admin = kafka.admin();
// const createTopic = async (topicName) => {
//   try {
//     await admin.connect();
//     const existingTopics = await admin.listTopics();
//     if (existingTopics.includes(topicName)) {
//       return;
//     }
//     await admin.createTopics({
//       topics: [
//         {
//           topic: topicName,
//           numPartitions: 3,
//           replicationFactor: 1,
//         },
//       ],
//     });
//     console.log("Topic created successfully");
//   } catch (error) {
//     console.error("Error creating topic:", error);
//   } finally {
//     await admin.disconnect();
//   }
// };
// async function listTopics() {
//   await admin.connect();
//   const topics = await admin.listTopics();
//   console.log("Topics:", topics);
//   await admin.disconnect();
// }
// const sendMessage = async (topic, message) => {
//   console.log(`Message send to ${topic}:`, message);
//   await producer.send({
//     topic,
//     messages: [{ value: JSON.stringify(message) }],
//   });
// };
// const subscribeToTopic = async (topic) => {
//   await consumer.subscribe({ topic });
//   await consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       console.log({
//         value: message.value.toString(),
//       });
//     },
//   });
// };
// run().catch(console.error);
// createTopic("login-events").catch(console.error);
// // listTopics().catch(console.error);
// // Kafka configs end here
// const app = express();
// app.use(cors());
// const server = http.Server(app);
// const io = require("socket.io")(server, {
//   cors: {
//     origin: [
//       "http://localhost:4200",
//       "http://192.1.150.239:4200",
//       "http://192.168.84.84:4200",
//       "http://192.168.251.84:4200",
//     ],
//   },
// });
// const hostname = process.env.HOSTNAME || "localhost";
// const port = process.env.PORT || 3000;
// let rooms = [];
// let users = [];
// let messages = [];
// server.on("error", (e) => {
//   if (e.code === "EADDRINUSE") {
//     console.error("Address already in use, retrying in a few seconds...");
//     setTimeout(() => {
//       server.listen(port, hostname, () => {
//         console.log(`Server running at http://${hostname}:${port}/`);
//       });
//     }, 5000);
//   }
// });
// io.on("connection", (socket) => {
//   console.log("a user connected with socket id: " + socket.id);
//   socket.on("login", (userData) => {
//     handleLogin(socket, io, userData, users);
//     sendMessage("login-events", userData);
//   });
//   socket.on("disconnect", () => {
//     console.log(`user with socket id: ${socket.id} disconnected`);
//     handleDisconnect(socket, io, users);
//   });
//   socket.on("join", (roomId) => {
//     socket.join(roomId);
//   });
//   socket.on("update-user", (user) => {
//     updateUser(io, users, user);
//   });
//   socket.on("update-current-room-id", ({ currentUserId, userIdToChat }) => {
//     handleP2PCurrentRoomId(socket, rooms, users, currentUserId, userIdToChat);
//   });
//   socket.on("get-room-info", (roomId) => {
//     distinctPrint("Users: ", users);
//     getRoomInfo(socket, rooms, roomId);
//   });
//   socket.on("message", ({ senderId, roomId, content, isRead }) => {
//     distinctPrint("Users: ", users);
//     handleMessages(socket, io, rooms, users, senderId, roomId, content, isRead);
//   });
// });
// app.get("/users", (req, res) => {
//   res.json(users);
// });
// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });
