const express = require("express");
const router = express.Router();
const { Post } = require("../models/post");
const { Member } = require("../models/member");
const { MediaContent } = require("../models/mediaContent");
const { isValidObjectId } = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const { PostLike } = require("../models/postLike");
const { BookMark } = require("../models/bookmark");
const { Follow } = require("../models/follow");
const { Comment } = require("../models/comment");
const { CommentLike } = require("../models/commentLike");

const DIR = "./public/mediaContents/";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, uuidv4() + "-" + fileName);
  },
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});
//새 게시물 작성
router.post(
  "/post/newPost/:userId",
  upload.array("mediaContents"),
  (req, res) => {
    try {
      const { userId } = req.params;

      const url = req.protocol + "://" + req.get("host");

      const post = new Post({
        member: userId,
        textContent: req.body.textContent,
      });
      post.save();

      for (let i = 0; i < req.files.length; i++) {
        const media = new MediaContent({
          post: post._id,
          mediaContent: url + "/public/mediaContents/" + req.files[i].filename,
        });
        media.save();
      }

      return res.status(200).send(post);
    } catch (err) {
      console.log(err);
      res.status(500).send({ err: err.message });
    }
  }
);
//홈 화면(게시물들, 내가 팔로잉한 사람들의 게시물까지) 렌더링
router.get("/getAllPosts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).send({ error: "userId is invalid" });
    }
    const myPosts = await Post.find({ member: userId }).sort({ date: -1 });
    const following = await Follow.find({
      memberFrom: userId,
    });
    const followingPosts = [];
    for (let i = 0; i < following.length; i++) {
      followingPosts.push(
        ...(await Post.find({ member: following[i].memberTo }).sort({
          date: -1,
        }))
      );
    }

    const allPosts = myPosts.concat(...followingPosts);
    const allPostsSorted = [...allPosts].sort((a, b) => b.date - a.date);
    let postSetArray = [];

    for (let i = 0; i < allPostsSorted.length; i++) {
      const postsMediaContent = await MediaContent.find({
        post: allPostsSorted[i]._id,
      });
      const writer = await Member.findById(allPostsSorted[i].member);

      const postSet = {
        writer: "",
        media: "",
        textContent: "",
        postId: "",
      };
      postSet.writer = writer;
      postSet.media = postsMediaContent;
      postSet.textContent = allPostsSorted[i].textContent;
      postSet.postId = allPostsSorted[i]._id;
      postSetArray[i] = postSet;
    }
    if (!allPostsSorted)
      return res.status(400).send({ error: "allPosts does not exist" });
    return res.send({ postSetArray });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//내 게시물들만 가져옴
router.get("/getMyPosts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).send({ error: "userId is invalid" });
    }
    const writer = await Member.findById(userId);
    const myPosts = await Post.find({ member: userId }).sort({ date: -1 });
    let myPostSetArray = [];

    for (let i = 0; i < myPosts.length; i++) {
      const myPostsMediaContent = await MediaContent.find({
        post: myPosts[i]._id,
      });
      const postSet = {
        writer: "",
        media: "",
        textContent: "",
        postId: "",
      };
      postSet.writer = writer;
      postSet.media = myPostsMediaContent;
      postSet.textContent = myPosts[i].textContent;
      postSet.postId = myPosts[i]._id;
      myPostSetArray[i] = postSet;
    }
    if (!myPosts)
      return res.status(400).send({ error: "myPosts does not exist" });
    return res.send({ myPostSetArray });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//내가 북마크한 것들만 가져옴
router.get("/getBookMarkPosts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).send({ error: "userId is invalid" });
    }

    const findBookMarked = await BookMark.find({ member: userId }).sort({
      date: -1,
    });
    const bookMarkedPosts = [];
    for (let i = 0; i < findBookMarked.length; i++) {
      bookMarkedPosts.push(
        ...(await Post.find({ _id: findBookMarked[i].post }))
      );
    }

    const bookMarkedPostsSorted = [...bookMarkedPosts].sort(
      (a, b) => b.date - a.date
    );
    let postSetArray = [];

    for (let i = 0; i < bookMarkedPostsSorted.length; i++) {
      const postsMediaContent = await MediaContent.find({
        post: bookMarkedPostsSorted[i]._id,
      });
      const writer = await Member.findById(bookMarkedPostsSorted[i].member);

      const postSet = {
        writer: "",
        media: "",
        textContent: "",
        postId: "",
      };
      postSet.writer = writer;
      postSet.media = postsMediaContent;
      postSet.textContent = bookMarkedPostsSorted[i].textContent;
      postSet.postId = bookMarkedPostsSorted[i]._id;
      postSetArray[i] = postSet;
    }
    if (!bookMarkedPostsSorted)
      return res.status(400).send({ error: "myPosts does not exist" });
    return res.send({ postSetArray });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//게시물 좋아요 등록
router.post("/posts/:postId/registPostLike/:userId", async (req, res) => {
  try {
    const { userId, postId } = req.params;

    const postLikeFind = await PostLike.find({
      member: userId,
      post: postId,
    });
    if (postLikeFind.length === 0) {
      const postLike = new PostLike({
        member: userId,
        post: postId,
      });
      postLike.save();
    }

    return res.status(200).send("successfuly");
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//게시물 좋아요 삭제
router.post("/posts/:postId/removePostLike/:userId", async (req, res) => {
  try {
    const { userId, postId } = req.params;

    await PostLike.deleteOne({
      member: userId,
      post: postId,
    });

    return res.status(200).send("successfuly");
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//게시물 좋아요 마크 렌더링
router.get("/posts/:postId/getPostLike/:userId", async (req, res) => {
  try {
    const { userId, postId } = req.params;

    const postLike = await PostLike.find({
      member: userId,
      post: postId,
    });

    return res.send({ postLike });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});

//게시물 북마크 등록
router.post("/posts/:postId/registBookMark/:userId", async (req, res) => {
  try {
    const { userId, postId } = req.params;

    const bookMarkFind = await BookMark.find({
      member: userId,
      post: postId,
    });
    if (bookMarkFind.length === 0) {
      const bookMark = new BookMark({
        member: userId,
        post: postId,
      });
      bookMark.save();
    }

    return res.status(200).send("successfuly");
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//게시물 북마크 삭제
router.post("/posts/:postId/removeBookMark/:userId", async (req, res) => {
  try {
    const { userId, postId } = req.params;

    await BookMark.deleteOne({
      member: userId,
      post: postId,
    });

    return res.status(200).send("successfuly");
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//게시물 북마크 마크 렌더링
router.get("/posts/:postId/getBookMark/:userId", async (req, res) => {
  try {
    const { userId, postId } = req.params;

    const bookMark = await BookMark.find({
      member: userId,
      post: postId,
    });

    return res.send({ bookMark });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//게시물 삭제
router.post("/posts/removePost/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    await Post.deleteOne({
      _id: postId,
    });
    await BookMark.deleteOne({
      post: postId,
    });
    await PostLike.deleteOne({
      post: postId,
    });
    const deleteComment = await Comment.deleteMany({
      post: postId,
    });
    for (let i = 0; i < deleteComment.length; i++) {
      await CommentLike.deleteMany({
        comment: deleteComment[i]._id,
      });
      const deleteReply = await Comment.deleteMany({
        perantComment: deleteComment[i]._id,
      });
      for (let i = 0; i < deleteReply.length; i++) {
        await CommentLike.deleteMany({
          comment: deleteReply[i]._id,
        });
      }
    }
    await MediaContent.deleteMany({
      post: postId,
    });

    return res.status(200).send("successfuly");
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});

//게시물 각각 조회(편집을 위한)
router.get("/posts/getPost/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    if (!isValidObjectId(postId)) {
      return res.status(400).send({ error: "postId is invalid" });
    }
    const post = await Post.findById(postId);

    const medias = await MediaContent.find({ post: postId });

    if (!post) return res.status(400).send({ error: "post does not exist" });
    return res.send({ post, medias });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});

//게시물 수정
router.post(
  "/post/editPost/:postId",
  upload.array("newMediaContents"),
  async (req, res) => {
    try {
      const { postId } = req.params;

      const removeMedias = req.body.removeMedia.split(",");
      for (let i = 0; i < removeMedias.length; i++) {
        await MediaContent.deleteOne({
          post: postId,
          mediaContent: removeMedias[i],
        });
      }
      await Post.findByIdAndUpdate(postId, {
        textContent: req.body.textContent,
      });

      const url = req.protocol + "://" + req.get("host");

      for (let i = 0; i < req.files.length; i++) {
        const media = new MediaContent({
          post: postId,
          mediaContent: url + "/public/mediaContents/" + req.files[i].filename,
        });
        media.save();
      }

      return res.status(200).send("sucess");
    } catch (err) {
      console.log(err);
      res.status(500).send({ err: err.message });
    }
  }
);
module.exports = router;
