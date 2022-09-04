const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const FollowSchema = new Schema({
  memberFrom: { type: Types.ObjectId, required: true, ref: "Member" },
  memberTo: { type: Types.ObjectId, required: true, ref: "Member" },
});
const Follow = mongoose.model("Follow", FollowSchema);
module.exports = { Follow };
