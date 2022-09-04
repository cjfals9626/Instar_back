const express = require("express");
const router = express.Router();
const { Post } = require("../models/post");
const { Member } = require("../models/member");
const { Comment } = require("../models/comment");
const { CommentLike } = require("../models/commentLike");

const { isValidObjectId } = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");

//댓글 작성
router.post("/posts/registComment/:userId", (req, res) => {
  try {
    const { userId } = req.params;

    const comment = new Comment({
      post: req.body.postId,
      member: userId,
      contents: req.body.commentContent,
    });
    comment.save();

    return res.status(200).send("successfuly");
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//게시물 처음에 렌더링될 때 같이 렌더링 될 해당 게시물의 댓글들
router.get("/getComment/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    if (!isValidObjectId(postId)) {
      return res.status(400).send({ error: "postId is invalid" });
    }

    const comments = await Comment.find({ post: postId }).sort({ date: 1 });
    if (!comments)
      return res.status(400).send({ error: "comments does not exist" });
    let commentSetArray = [];
    for (let i = 0; i < comments.length; i++) {
      const member = await Member.findById(comments[i].member);
      const commentSet = {
        writer: "",
        comment: "",
      };
      commentSet.writer = member;
      commentSet.comment = comments[i];
      commentSetArray[i] = commentSet;
    }
    return res.send({ commentSetArray });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});

//댓글 좋아요 등록
router.post(
  "/comments/:commentId/registCommentLike/:userId",
  async (req, res) => {
    try {
      const { userId, commentId } = req.params;

      const commentLikeFind = await CommentLike.find({
        member: userId,
        comment: commentId,
      });
      if (commentLikeFind.length === 0) {
        const commentLike = new CommentLike({
          member: userId,
          comment: commentId,
        });
        commentLike.save();
      }

      return res.status(200).send("successfuly");
    } catch (err) {
      console.log(err);
      res.status(500).send({ err: err.message });
    }
  }
);
//댓글 좋아요 삭제
router.post(
  "/comments/:commentId/removeCommentLike/:userId",
  async (req, res) => {
    try {
      const { userId, commentId } = req.params;

      await CommentLike.deleteOne({
        member: userId,
        comment: commentId,
      });

      return res.status(200).send("successfuly");
    } catch (err) {
      console.log(err);
      res.status(500).send({ err: err.message });
    }
  }
);
//댓글 좋아요 마크 렌더링
router.get("/comments/:commentId/getCommentLike/:userId", async (req, res) => {
  try {
    const { userId, commentId } = req.params;

    const commentLike = await CommentLike.find({
      member: userId,
      comment: commentId,
    });

    return res.send({ commentLike });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//대댓글(reply) 작성
router.post("/posts/registReply/:userId", (req, res) => {
  try {
    const { userId } = req.params;

    const comment = new Comment({
      perantComment: req.body.commentId,
      member: userId,
      contents: req.body.commentContent,
    });
    comment.save();

    return res.status(200).send("successfuly");
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//댓글 처음 렌더링시 대댓글 렌더링
router.get("/getReply/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
      return res.status(400).send({ error: "commentId is invalid" });
    }

    const replys = await Comment.find({ perantComment: commentId }).sort({
      date: 1,
    });
    if (!replys)
      return res.status(400).send({ error: "replys does not exist" });
    let commentSetArray = [];
    for (let i = 0; i < replys.length; i++) {
      const member = await Member.findById(replys[i].member);
      const commentSet = {
        writer: "",
        comment: "",
      };
      commentSet.writer = member;
      commentSet.comment = replys[i];
      commentSetArray[i] = commentSet;
    }
    return res.send({ commentSetArray });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
module.exports = router;
