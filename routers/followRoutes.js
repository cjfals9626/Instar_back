const express = require("express");
const router = express.Router();
const { Post } = require("../models/post");
const { Member } = require("../models/member");
const { Comment } = require("../models/comment");
const { CommentLike } = require("../models/commentLike");
const { SearchUser } = require("../models/searchUser");
const { Follow } = require("../models/follow");

//팔로우하기
router.post("/follow/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const following = await new Follow({
      memberFrom: userId,
      memberTo: req.body.followTo,
    });
    following.save();
    return res.status(200).send({ following });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//해당 사용자에 대한 팔로우 여부
router.post("/checkFollow/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const following = await Follow.find({
      memberFrom: userId,
      memberTo: req.body.followTo,
    });
    return res.status(200).send(following.length !== 0);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//언팔로우
router.post("/unFollow/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const following = await Follow.deleteOne({
      memberFrom: userId,
      memberTo: req.body.followTo,
    });
    return res.status(200).send({ following });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//팔로잉한 유저 가져옴
router.get("/followingCount/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const following = await Follow.find({
      memberFrom: userId,
    });
    const followingMembers = [];
    for (let i = 0; i < following.length; i++) {
      followingMembers.push(await Member.findById(following[i].memberTo));
    }
    return res.status(200).send({ followingMembers });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//팔로워한 유저 가져옴
router.get("/followerCount/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const follower = await Follow.find({
      memberTo: userId,
    });
    const followerMembers = [];
    for (let i = 0; i < follower.length; i++) {
      followerMembers.push(await Member.findById(follower[i].memberFrom));
    }
    return res.status(200).send({ followerMembers });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
module.exports = router;
