var express = require("express");
var router = express.Router();

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

// send all courseList
router.get("/getAll", async (req, res) => {
  // collection명
  const collection = myDb.collection("courses");

  var result = [];

  var cursor = collection.find();
  await cursor.forEach((doc, index, array) => {
    if (doc) {
      result.push(doc);
    }
  });

  res.status(200).send(result);
//   console.log(result);
});

module.exports = router;
