var express = require("express");
var router = express.Router();
var multer = require("multer");
var crypto = require("crypto");
var fs = require("fs");

var Client = require("mongodb").MongoClient;
var databaseUrl = "mongodb://localhost:27017";
var myDb;

// db 연결
Client.connect(databaseUrl, function (err, database) {
  if (err) throw err;

  // console.log("데이터베이스에 연결됨: " + databaseUrl);
  // database명
  myDb = database.db("travel");
});

const _storage = multer.diskStorage({
  // 실제 저장되는 파일경로 설정
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  // 실제 저장되는 파일명 설정
  filename: function (req, file, cb) {
    return crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) {
        return cb(err);
      }
      return cb(null, file.originalname);
    });
  },
});

const upload = multer({ storage: _storage });
// const upload = multer({ dest: "uploads/" });

// 프로필 사진 업로드
router.post("/uploadUserPic", upload.array("image"), function (req, res) {
  const files = req.files;
  // console.log(files);
  const collection = myDb.collection("users");

  files.forEach((el) => {
    const arr = el.filename.split("_");
    // console.log(el.filename);
    // console.log(arr);
    // console.log(arr[0]);
    const query = {
      email: arr[0],
    };

    collection.updateOne(query, { $set: { image: el.filename } });
  });

  return res.status(200).end();
});

// 프로필 사진 삭제
router.post("/deleteUserPic", async function (req, res) {
  const query = {
    email: req.body.email,
  };

  const collection = myDb.collection("users");

  collection.findOne(query, (err, result) => {
    if (result.image != null) {
      const filePath = "./uploads/" + result.image;
      fs.unlink(filePath, (err) =>
        err ? console.log(err) : console.log("deleted")
      );
      collection.updateOne(query, { $set: { image: "" } });
      return res.status(200).send();
    }
  });
});

// 여행 대표 사진 업로드
router.post("/uploadThumbnail", upload.array("image"), function (req, res) {
  const files = req.files;
  // console.log(files);
  const collection = myDb.collection("courses");

  files.forEach((el) => {
    const arr = el.filename.split("_");
    const query = {
      region: arr[0],
      title: arr[1],
    };

    collection.updateOne(query, { $set: { image: el.filename } });
  });

  return res.status(200).end();
});

// 여행 대표 사진 삭제
router.post("/deleteThumbnail", async function (req, res) {
  const query = {
    region: req.body.region,
    title: req.body.title,
  };

  const collection = myDb.collection("courses");

  collection.findOne(query, (err, result) => {
    if (result.image != null) {
      const filePath = "./uploads/" + result.image;
      fs.unlink(filePath, (err) =>
        err ? console.log(err) : console.log("deleted")
      );
      collection.updateOne(query, { $set: { image: "" } });
      return res.status(200).send();
    }
  });
});

// 이미지 전송
router.post("/getImage", function (req, res) {
  var filename = req.body.name;
  // console.log("check", filename);
  var filePath = "./uploads/" + filename;

  fs.readFile(filePath, function (err, data) {
    if (err) {
      // console.log(err);
      res.status(404);
    } else {
      // console.log(filePath);
      // console.log(data);
      res.status(200).end(data);
    }
  });
});

// 장소 사진 업로드
router.post("/upload", upload.array("image"), function (req, res) {
  const files = req.files;
  // console.log(files);
  const collection = myDb.collection("wishSpot");

  files.forEach((el) => {
    const arr = el.filename.split("_");

    const query = {
      title: arr[1],
      region: arr[2],
      address: arr[3],
    };

    collection.updateOne(query, { $push: { image: el.filename } });
  });

  return res.status(200).end();
});

// 장소 이미지 삭제
router.post("/deleteImage", async function (req, res) {
  var filename = req.body.name;
  // console.log(filename);
  var filePath = "./uploads/" + filename;

  fs.unlink(filePath, (err) =>
    err ? console.log(err) : console.log("deleted")
  );

  const query = {
    email: req.body.email,
    region: req.body.region,
    title: req.body.title,
    address: req.body.address,
  };

  const collection = myDb.collection("wishSpot");

  await collection.updateOne(query, { $pull: { image: filename } });

  collection.findOne(query, (err, result) => {
    if (result != null) {
      // console.log(JSON.stringify(result));
      res.status(200).send(JSON.stringify(result));
    } else {
      res.status(404).send();
    }
  });
});

module.exports = router;
