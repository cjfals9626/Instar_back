const mongoose = require("mongoose");
const { Schema } = mongoose;
const ChatRoomSchema = new Schema({
  roomName: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);
module.exports = { ChatRoom };
