const { generateMessageId, distinctPrint } = require("../../common");

function handleMessages(socket, io, rooms, users, senderId, roomId, content, isRead) {
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

module.exports = { handleMessages };
