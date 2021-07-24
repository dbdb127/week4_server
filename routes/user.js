var express = require("express");
var router = express.Router();

// db 설정
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

// encrypt password
var crypto = require("crypto");

var creepy = function (clear) {
  // Random salt
  let length = 16;
  let salt = crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);

  // SHA
  let hash = crypto.createHmac("sha512", salt);
  hash.update(clear);
  return {
    salt: salt,
    hash: hash.digest("hex"),
  };
};

var validate = function (loginpass, hashedpass, salt) {
  let hash = crypto.createHmac("sha512", salt);
  hash.update(loginpass);
  loginpass = hash.digest("hex");
  return loginpass == hashedpass;
};

// signup
router.post("/signup", (req, res) => {
  // collection명
  const collection = myDb.collection("users");

  const pw = req.body.password;
  var creeped = creepy(pw);

  const newUser = {
    name: req.body.name,
    email: req.body.email,
    hash: creeped.hash,
    salt: creeped.salt,
  };

  const query = { email: newUser.email };

  collection.findOne(query, (err, result) => {
    if (result == null) {
      // console.log(result);
      collection.insertOne(newUser, (err, result) => {
        res.status(200).send();
      });
    } else {
      res.status(404).send();
    }
  });
});

// login
router.post("/login", (req, res) => {
  // collection명
  const collection = myDb.collection("users");
  // console.log("/login");
  // console.log(req.body);

  const pw = req.body.password;

  const query = {
    email: req.body.email,
  };

  collection.findOne(query, (err, result) => {
    if (result != null) {
      // console.log(result);

      var validated = validate(pw, result.hash, result.salt);

      if (validated) {
        const objToSend = {
          name: result.name,
          email: result.email,
        };
        // login success
        res.status(200).send(JSON.stringify(objToSend));
      } else {
        // pw error
        res.status(400).send();
      }
    } else {
      // no account
      res.status(404).send();
    }
  });
});

module.exports = router;
