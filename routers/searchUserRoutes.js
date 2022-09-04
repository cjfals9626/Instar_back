const express = require("express");
const router = express.Router();
const { Post } = require("../models/post");
const { Member } = require("../models/member");
const { Comment } = require("../models/comment");
const { CommentLike } = require("../models/commentLike");
const { SearchUser } = require("../models/searchUser");

//사용자 검색 기록
router.post("/registSearchUser/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const existSearchRecord = await SearchUser.find({
      searchedMember: req.body.searchUserId,
    });
    if (existSearchRecord.length === 0) {
      const searched = await new SearchUser({
        member: userId,
        searchedMember: req.body.searchUserId,
      });
      searched.save();
      return res.status(200).send({ searched });
    }

    return res.status(200).send("existing");
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
router.post("/searchRecordAllClear", async (req, res) => {
  try {
    await SearchUser.deleteMany({
      member: req.body.userId,
    });

    return res.status(200);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
router.post("/searchRecordEachClear", async (req, res) => {
  try {
    await SearchUser.deleteOne({
      searchedMember: req.body.userId,
    });

    return res.status(200);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
module.exports = router;
