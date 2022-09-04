const express = require("express");
const cors = require("cors");
const app = express();
const history = require("connect-history-api-fallback");
const mongoose = require("mongoose");
let bodyParser = require("body-parser");
const memberRoutes = require("./routers/memberRoutes");
const postRoutes = require("./routers/postRoutes");
const commentRoutes = require("./routers/commentRoutes");
const searchUserRoutes = require("./routers/searchUserRoutes");
const followRoutes = require("./routers/followRoutes");
const dmRoutes = require("./routers/dmRoutes");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./routers/users.js");
const { ChatRoom } = require("./models/chatRoom");
const { Chat } = require("./models/chat");

const http = require("http");
const { copyFileSync } = require("fs");

const hostname = "127.0.0.1";
const port = 8080;
const DB_URI = "mongodb://127.0.0.1:27017/instar";

const server = async () => {
  try {
    await mongoose.connect(DB_URI);
    app.use(cors({ origin: "http://localhost:3000", credentials: true }));
    app.use(express.json());
    app.use(history());
    app.use(
      bodyParser.json({
        limit: "10mb",
      })
    );
    app.use(
      bodyParser.urlencoded({
        limit: "10mb",
        extended: false,
      })
    );
    app.use(cors());
    app.use("/public", express.static("public"));
    app.use(postRoutes);
    app.use(memberRoutes);
    app.use(commentRoutes);
    app.use(searchUserRoutes);
    app.use(followRoutes);
    app.use(dmRoutes);

    app.use((req, res, next) => {
      setImmediate(() => {
        next(new Error("Something went wrong"));
      });
    });
    app.use(function (err, req, res, next) {
      console.error(err.message);
      if (!err.statusCode) err.statusCode = 500;
      res.status(err.statusCode).send(err.message);
    });

    const server = app.listen(port, hostname, function () {
      console.log("server is running");
    });
    const io = require("socket.io")(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    }); //cors 오류로 인한 설정

    io.on("connection", (socket) => {
      console.log("새로운 connection이 발생하였습니다.");
      socket.on("join", async ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });
        if (error) callback({ error: "에러가 발생했어요." });
        let theRoom = await ChatRoom.findOne({
          roomName: room,
        });

        const chatRecord = await Chat.find({ room: theRoom.roomName });
        for (let i = 0; i < chatRecord.length; i++) {
          socket.emit("message", {
            user: chatRecord[i].sender,
            text: chatRecord[i].message,
          });
        }
        // socket.broadcast.to(user.room).emit("message", {
        //   user: "admin",
        //   text: `${user.name} 님이 가입하셨습니다.`,
        // });
        io.to(user.room).emit("roomData", {
          room: user.room,
          users: getUsersInRoom(user.room),
        });
        socket.join(user.room);

        callback();
      });
      socket.on("sendMessage", (message, callback) => {
        const user = getUser(socket.id);
        const newMessage = new Chat({
          room: user.room,
          sender: user.name,
          message: message,
        });
        newMessage.save();
        io.to(user.room).emit("message", { user: user.name, text: message });
        callback();
      });
      socket.on("disconnect", () => {
        const user = removeUser(socket.id);

        if (user) {
          io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room),
          });
        }
        console.log("유저가 떠났어요.");
      });
    });
    // io.on("connection", (socket) => {
    //   console.log("새로운 connection이 발생하였습니다.");
    //   socket.on("join", async ({ name }, callback) => {
    //     socket.on("join_chatRoom", async ({ room }, callback) => {
    //       console.log(room + "aaa");
    //       const { error, user } = addUser({ id: socket.id, name, room });
    //       if (error) callback({ error: "에러가 발생했어요." });
    //       let theRoom = await ChatRoom.findOne({
    //         roomName: room,
    //       });

    //       const chatRecord = await Chat.find({ room: theRoom.roomName });
    //       for (let i = 0; i < chatRecord.length; i++) {
    //         socket.emit("message", {
    //           user: chatRecord[i].sender,
    //           text: chatRecord[i].message,
    //         });
    //       }
    //       io.to(user.room).emit("roomData", {
    //         room: user.room,
    //         users: getUsersInRoom(user.room),
    //       });
    //       socket.join(user.room);

    //       callback();
    //     });
    //     callback();
    //   });
    //   socket.on("sendMessage", (message, callback) => {
    //     const user = getUser(socket.id);
    //     const newMessage = new Chat({
    //       room: user.room,
    //       sender: user.name,
    //       message: message,
    //     });
    //     newMessage.save();
    //     io.to(user.room).emit("message", { user: user.name, text: message });
    //     callback();
    //   });
    //   socket.on("disconnect", () => {
    //     const user = removeUser(socket.id);

    //     if (user) {
    //       io.to(user.room).emit("roomData", {
    //         room: user.room,
    //         users: getUsersInRoom(user.room),
    //       });
    //     }
    //     console.log("유저가 떠났어요.");
    //   });
    // });
  } catch (err) {
    console.log(err);
  }
};

server();

module.exports = app;
