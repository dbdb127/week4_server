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

// 업로드
router.post("/upload", upload.array("image"), function (req, res) {
  const files = req.files;
  // console.log(files);
  const collection = myDb.collection("wishSpot");

  files.forEach((el) => {
    const arr = el.filename.split("_");

    const query = {
      email: arr[0],
      title: arr[1],
      region: arr[2],
      address: arr[3],
    };

    collection.updateOne(query, { $push: { image: el.filename } });
  });

  return res.status(200).end();
});

router.post("/getImage", function (req, res) {
  var filename = req.body.name;
  // console.log(filename);
  var filePath = "./uploads/" + filename;

  fs.readFile(filePath, function (err, data) {
    if (err) {
      // console.log(err);
      res.end(null);
    } else {
      // console.log(filePath);
      // console.log(data);
      res.end(data);
    }
  });
});

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
