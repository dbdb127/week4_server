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

//login
router.post("/login", (req, res) => {
  // collection명
  const collection = myDb.collection("users");
  // console.log("/login");
  // console.log(req.body);
  const query = {
    email: req.body.email,
    password: req.body.password,
  };

  collection.findOne(query, (err, result) => {
    if (result != null) {
      // console.log(result);
      const objToSend = {
        name: result.name,
        email: result.email,
      };

      res.status(200).send(JSON.stringify(objToSend));
    } else {
      res.status(404).send();
    }
  });
});

module.exports = router;
