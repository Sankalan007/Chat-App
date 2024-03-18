const { generateRoomId } = require("../../common");
const { isP2PUsers } = require("../users");

function getRoomInfo(socket, rooms, roomId) {
  const room = rooms.find((r) => {
    return r.roomId === roomId;
  });
  socket.emit("get-room-info", room);
}

function handleP2PCurrentRoomId(socket, rooms, users, currentUserId, userIdToChat) {
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

module.exports = { getRoomInfo, handleP2PCurrentRoomId };
