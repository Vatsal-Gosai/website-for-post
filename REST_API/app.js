const express = require("express");

const path = require("path");

const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const multer = require("multer");
const app = express();

// For IOS only
// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'images');
//   },
//   filename: (req, file, cb) => {
//     cb(null, new Date().toISOString() + '-' + file.originalname);
//   }
// });

const fileStorage = multer.diskStorage({
  // set the path for storing images
  destination: (req, file, cb) => {
    cb(null, "images");
  },

  // for image name store in images folder
  filename: (req, file, cb) => {
    const currentDate = new Date().toISOString().slice(0, 10);
    const currentTime = new Date()
      .toISOString()
      .slice(11, 19)
      .replace(/:/g, "-");
    const ext = path.extname(file.originalname);
    cb(null, currentDate + "-" + currentTime + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

mongoose
  .connect(
    "mongodb+srv://gosaivatsal30:VEnFvmpfpcpGBMyS@online-shop.bha9bqn.mongodb.net/test-messages"
  )
  .then((result) => {
    const server = app.listen(8080);
    console.log("Connected Successfully!");

    // Websockets build up on http, server use http and we used that http server to establish our web socket connection
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log("Client connected");
    });
  })
  .catch((err) => {
    console.log(err);
  });
