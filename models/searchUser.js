const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const SearchUserSchema = new Schema({
  member: { type: Types.ObjectId, required: true, ref: "Member" },
  searchedMember: { type: Types.ObjectId, required: true, ref: "Member" },
  date: { type: Date, default: Date.now },
});
const SearchUser = mongoose.model("SearchUser", SearchUserSchema);
module.exports = { SearchUser };
