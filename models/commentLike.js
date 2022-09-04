const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const CommentLikeSchema = new Schema({
  member: { type: Types.ObjectId, required: true, ref: "Member" },
  comment: { type: Types.ObjectId, required: true, ref: "Comment" },
});
const CommentLike = mongoose.model("CommentLike", CommentLikeSchema);
module.exports = { CommentLike };
