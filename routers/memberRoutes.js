const express = require("express");
const router = express.Router();
const { Member } = require("../models/member");
const { SearchUser } = require("../models/searchUser");

const { isValidObjectId } = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");

const DIR = "./public/profiles/";
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
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png .jpg and .jpeg format allowed!"));
    }
  },
});
//sign up
router.post("/sign/member", async (req, res) => {
  try {
    const members = new Member(req.body);
    if (await Member.findOne({ id: members.id })) return res.status(400).send();
    if (await Member.findOne({ userName: members.userName }))
      return res.status(400).send();

    await members.save();
    return res.status(200).send({ members });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});

// login
router.post("/login/member", async (req, res) => {
  try {
    const { id, password } = req.body;
    const memberId = await Member.findOne({
      id: id,
      password: password,
    }).exec();
    const memberName = await Member.findOne({
      userName: id,
      password: password,
    }).exec();

    if (memberId === null && memberName === null) {
      return res.status(401).send("not found");
    } else if (memberId != null) {
      return res.status(200).send(memberId._id);
    } else {
      return res.status(200).send(memberName._id);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//프로필 화면 렌더링
router.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).send({ error: "userId is invalid" });
    }

    const member = await Member.findById(userId);
    if (!member) return res.status(400).send({ error: "user does not exist" });
    return res.send({ member });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//프로필 이미지 교체
router.post(
  "/profile/:userId/changeImg",
  upload.single("profileImg"),
  async (req, res, next) => {
    try {
      const url = req.protocol + "://" + req.get("host");
      const { userId } = req.params;
      const updateProfileImg = await Member.findByIdAndUpdate(userId, {
        profileImg: url + "/public/profiles/" + req.file.filename,
      });
      return res.send(updateProfileImg);
    } catch (err) {
      console.log(err);
      res.status(500).send({ err: err.message });
    }
  }
);
//프로필이미지 디폴트로 교체
router.post("/profile/:userId/defaultImg", async (req, res, next) => {
  try {
    const url = req.protocol + "://" + req.get("host");
    const { userId } = req.params;
    const updateProfileImg = await Member.findByIdAndUpdate(userId, {
      profileImg: url + "/public/profiles/defaultProfile.jpg",
    });
    return res.send(updateProfileImg);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//위에 검색누르면 검색 기록 보임
router.post("/getUsers", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!isValidObjectId(userId)) {
      return res.status(400).send({ error: "userId is invalid" });
    }

    const searched = await SearchUser.find({ member: userId }).sort({
      date: 1,
    });
    let members = [];
    for (let i = 0; i < searched.length; i++) {
      members.push(await Member.findById(searched[i].searchedMember));
    }
    if (!members)
      return res.status(400).send({ error: "users does not exist" });
    return res.send({ members });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//위에 검색 실시하면 검색한 user 반환
router.post("/findUsers/:userId/:keyword", async (req, res) => {
  try {
    const { userId, keyword } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).send({ error: "userId is invalid" });
    }

    const member = await Member.find({
      userName: { $regex: ".*" + keyword + ".*" },
    });
    if (!member) return res.status(400).send({ error: "users does not exist" });
    return res.send({ member });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
/*
router.post('/member', async (req, res) => {
    const member = new Member(req.body);
    await member.save();
    return res.send({ member });
});

router.get('/memberGet', async (req, res) => {
    try {
        const members = await Member.find({});
        res.send(members);
    } catch (err) {
        console.log(err);
        res.status(500).send({ err: err.message });
    }
});
*/
module.exports = router;
