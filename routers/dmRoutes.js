const express = require("express");
const router = express.Router();
const { Member } = require("../models/member");
const { ChatRoom } = require("../models/chatRoom");
const { Chat } = require("../models/chat");

//새로운 채팅방 개설
router.post("/newChatRoomOpen/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const members = req.body.members;
    const member = await Member.findById(userId);
    let newRoomName = member.userName;
    for (let i = 0; i < members.length; i++) {
      newRoomName += " and " + members[i].userName;
    }

    let theRoom = await ChatRoom.findOne({
      roomName: newRoomName,
    });
    if (!theRoom) {
      const newRoom = new ChatRoom({
        roomName: newRoomName,
      });
      newRoom.save();
      theRoom = newRoom;
    }
    return res.status(200).send("successfuly");
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//채팅방 불러오기
router.get("/chatRooms/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const member = await Member.findById(userId);
    let chatRooms = await ChatRoom.find({
      roomName: { $regex: ".*" + member.userName + ".*" },
    });
    return res.status(200).send({ chatRooms });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});
//채팅방 삭제
router.post("/deleteChatRoom", async (req, res) => {
  try {
    const roomName = req.body.roomName;
    const deleteRoom = await ChatRoom.deleteOne({ roomName: roomName });
    await Chat.deleteMany({ room: roomName });
    // const member = await Member.findById(userId);
    // let newRoomName = member.userName;
    // for (let i = 0; i < members.length; i++) {
    //   newRoomName += " and " + members[i].userName;
    // }

    // let theRoom = await ChatRoom.findOne({
    //   roomName: newRoomName,
    // });
    // if (!theRoom) {
    //   const newRoom = new ChatRoom({
    //     roomName: newRoomName,
    //   });
    //   newRoom.save();
    //   theRoom = newRoom;
    // }
    return res.status(200).send("successfuly");
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});

module.exports = router;
