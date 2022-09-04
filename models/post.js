const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const PostSchema = new Schema({
  member: { type: Types.ObjectId, required: true, ref: "Member" },
  textContent: { type: String, required: true },
  date: { type: Date, default: Date.now },
});
const Post = mongoose.model("Post", PostSchema);
module.exports = { Post };
