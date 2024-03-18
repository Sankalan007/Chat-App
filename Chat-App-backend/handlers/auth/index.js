const { generateUserId, distinctPrint } = require("../../common");

function handleLogin(socket, io, userData, users) {
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

function handleDisconnect(socket, io, users) {
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

module.exports = { handleLogin, handleDisconnect };
