const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const MediaContentSchema = new Schema({
  post: { type: Types.ObjectId, required: true, ref: "Post" },
  mediaContent: { type: String, required: true },
});
const MediaContent = mongoose.model("MediaContent", MediaContentSchema);
module.exports = { MediaContent };
