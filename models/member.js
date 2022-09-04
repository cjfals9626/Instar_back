const mongoose = require("mongoose");
const { Schema } = mongoose;
const MemberSchema = new Schema({
  id: { type: String, required: true },
  profileImg: {
    type: String,
    default: "http://localhost:3000/public/profiles/defaultProfile.jpg",
  },
  userName: { type: String, require: true },
  fullName: { type: String, require: true },
  password: { type: String, required: true },
});

const Member = mongoose.model("Member", MemberSchema);
module.exports = { Member };
