const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const PostLikeSchema = new Schema({
  member: { type: Types.ObjectId, required: true, ref: "Member" },
  post: { type: Types.ObjectId, required: true, ref: "Post" },
});
const PostLike = mongoose.model("PostLike", PostLikeSchema);
module.exports = { PostLike };
