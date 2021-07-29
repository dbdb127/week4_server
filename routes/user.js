var express = require("express");
var router = express.Router();

// db 설정
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
    image: "",
    calendar: [],
    login: false,
    friends: [],
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
router.post("/login", async (req, res) => {
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
        collection.updateOne(query, { $set: { login: true } });

        const objToSend = {
          name: result.name,
          email: result.email,
          image: result.image,
          calendar: result.calendar,
          login: true,
        };

        // login success
        res.status(200).send(JSON.stringify(objToSend));
      } else {
        // pw error
        res.status(404).send();
      }
    } else {
      // no account
      res.status(404).send();
    }
  });
});

// logout
router.post("/logout", (req, res) => {
  // collection명
  console.log(req.body.email);
  const collection = myDb.collection("users");
  const query = { email: req.body.email };
  collection.updateOne(query, { $set: { login: false } });
  res.status(200).send();
});

// check wheter user is log in or not
router.post("/isLogin", (req, res) => {
  // collection명
  const collection = myDb.collection("users");

  const query = { email: req.body.email };

  collection.findOne(query, (err, result) => {
    if (result != null) {
      res.status(200).send(result.login);
    } else {
      // no account
      res.status(404).send();
    }
  });
});

// send userInfo
router.post("/userInfo", (req, res) => {
  // collection명
  const collection = myDb.collection("users");

  const query = { email: req.body.email };

  collection.findOne(query, (err, result) => {
    if (result != null) {
      const objToSend = {
        name: result.name,
        email: result.email,
        image: result.image,
        calendar: result.calendar,
        login: result.login,
        friends: result.friends,
      };
      res.status(200).send(JSON.stringify(objToSend));
    } else {
      // no account
      res.status(404).send();
    }
  });
});

// set user date
router.post("/sendDays", (req, res) => {
  // collection명
  const collection = myDb.collection("users");

  const query = { email: req.body.email };

  collection.updateOne(query, { $set: { calendar: req.body.days } });

  res.status(200).send();
});

// set user date
router.post("/getFriendDays", (req, res) => {
  // collection명
  const collection = myDb.collection("users");

  const query = { email: req.body.email };

  collection.findOne(query, (err, result) => {
    if (result != null) {
      const objToSend = {
        email: result.email,
        days: result.calendar,
      };
      res.status(200).send(JSON.stringify(objToSend));
    } else {
      // no account
      res.status(404).send();
    }
  });
});

module.exports = router;
