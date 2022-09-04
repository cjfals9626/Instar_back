const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const CommentSchema = new Schema({
  post: { type: Types.ObjectId, ref: "Post" },
  member: { type: Types.ObjectId, required: true, ref: "Member" },
  perantComment: { type: String, ref: "Comment" },
  contents: { type: String },
  date: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", CommentSchema);
module.exports = { Comment };
