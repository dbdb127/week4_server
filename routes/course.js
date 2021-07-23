var express = require("express");
var router = express.Router();

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

//courseList
router.post("/courseList", async (req, res) => {
  // collection명
  const collection = myDb.collection("courses");
  // console.log(req.body);

  const query = {
    email: req.body.email,
  };

  var result = [];

  var cursor = collection.find(query);

  await cursor.forEach((doc, index, array) => {
    if (doc) {
      // console.log(doc);
      result.push(doc);
    }
  });

  res.status(200).send(result);
});

module.exports = router;
