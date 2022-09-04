const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const BookMarkSchema = new Schema({
  member: { type: Types.ObjectId, required: true, ref: "Member" },
  post: { type: Types.ObjectId, required: true, ref: "Post" },
});
const BookMark = mongoose.model("BookMark", BookMarkSchema);
module.exports = { BookMark };
