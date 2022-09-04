const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const ChatSchema = new Schema({
  //room: { type: Types.ObjectId, ref: "ChatRoom" },
  room: { type: String },
  //sender: { type: Types.ObjectId, required: true, ref: "Member" },
  sender: { type: String },
  message: { type: String },
  date: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", ChatSchema);
module.exports = { Chat };
