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

function updateUser(io, users, userToUpdate) {
  const existingUserIndex = users.findIndex(
    (user) => user.userId === userToUpdate.userId
  );
  if (existingUserIndex !== -1) {
    users[existingUserIndex] = userToUpdate;
  }
  io.emit("update-user", userToUpdate);
}

module.exports = {isP2PUsers, updateUser};
