const { v4: uuidv4 } = require("uuid");
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

function distinctPrint(caption, object) {
  console.log(
    "\n\n\n\n\n\n\n\n<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
  );
  console.log(caption, object);
  console.log(
    "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\n\n\n\n\n\n\n\n"
  );
}

module.exports = {
  generateUserId,
  generateRoomId,
  generateMessageId,
  distinctPrint,
};
