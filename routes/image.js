var express = require("express");
var router = express.Router();
var multer = require("multer");
var crypto = require("crypto");

var Client = require("mongodb").MongoClient;
var databaseUrl = "mongodb://localhost:27017";
var myDb;

// db 연결
Client.connect(databaseUrl, function (err, database) {
  if (err) throw err;

  console.log("데이터베이스에 연결됨: " + databaseUrl);
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

// 업로드
router.post("/upload", upload.array("images", 10), function (req, res) {
  const url = location.search;
  console.log("url", url);

  // const query = {
  //   email: req.params.email,
  //   region: req.params.region,
  //   name: req.params.name,
  // };

  const files = req.files;
  console.log(files);
  const collection = myDb.collection("wishSpot");

  // db에 저장

  return res.status(200).end();
});

// router.get("/uploads/:img", function (req, res) {
//   var file = req.params.upload;
//   console.log(file);
//   var img = fs.readFileSync(__dirname + "/uploads/" + file);

//   res.writeHead(200, { "Content-Type": "image/png" });
//   res.end(img, "binary");
// });

/* 다운로드 요청 처리 */
var register_number_for_img;
var img_cnt;

router.post("/getimgmain", function (req, res) {
  console.log("이미지요청");
  console.log(req.body);
  //var register_number = req.body.register_number;
  var register_number = req.body.register_number;
  var i = req.body.img_cnt;
  var filename = register_number + "_" + i + ".png";
  var filePath = __dirname + "/uploads/" + filename;

  fs.readFile(filePath, function (err, data) {
    if (err) {
      console.log(err);
      filename = "defaltImg.png";
      filePath = __dirname + "/uploads/" + filename;
      fs.readFile(filePath, function (err, data) {
        console.log(filePath);
        console.log(data);
        res.end(data);
      });
    } else {
      console.log(filePath);
      console.log(data);
      res.end(data);
    }
  });
});

router.post("/getimg", function (req, res) {
  console.log("이미지요청");
  console.log(req.body);
  var register_number = req.body.register_number;
  var i = req.body.img_cnt;
  var filename = register_number + "_" + i + ".png";
  var filePath = __dirname + "/uploads/" + filename;

  fs.readFile(filePath, function (err, data) {
    if (err) {
      console.log(err);
      res.end(null);
    } else {
      console.log(filePath);
      console.log(data);
      res.end(data);
    }
  });
});

module.exports = router;
