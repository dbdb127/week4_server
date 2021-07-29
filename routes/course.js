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

// saveCourse
router.post("/saveCourse", async (req, res) => {
  // collection명
  const userCol = myDb.collection("users");
  const parti = req.body.participants;

  for (var i = 0; i < parti.length; i++) {
    userCol.findOne({ email: parti[i] }, (err, result) => {
      if (result) {
        parti.forEach((el) => {
          if (!result.friends.includes(el) && el != result.email) {
            // friends list에 안들어있다면 추가하기
            userCol.updateOne(
              { email: result.email },
              { $push: { friends: el } }
            );
          }
        });
      }
    });
  }

  var tmpDays = [];

  const daysCol = myDb.collection("selectDays");
  daysCol.findOne({ place: req.body.region }, (err, result) => {
    if (result != null) {
      tmpDays = result.days;
    }

    // console.log(tmpDays);
    const newCourse = {
      participants: req.body.participants,
      region: req.body.region,
      totalSize: req.body.totalSize,
      title: req.body.title,
      locations: req.body.locations,
      image: "",
      date: tmpDays,
    };

    // console.log(newCourse.totalSize);
    const collection = myDb.collection("courses");
    collection.insertOne(newCourse, (err, result) => {
      if (err) {
        // console.log("course already exists");
      }
    });
  });

  const locations = req.body.locations;
  const spotCol = myDb.collection("wishSpot");

  await locations.forEach((el) => {
    const newSpot = {
      participants: req.body.participants,
      region: req.body.region,
      title: req.body.title,
      address: el.address,
      latitude: el.latitude,
      longtitude: el.longtitude,
      image: [],
      memo: "",
    };

    spotCol.insertOne(newSpot, (err, result) => {
      if (err) {
        // console.log("spot already exists");
      }
    });
  });

  res.status(200).send();
});

// send courseList
router.post("/courseList", async (req, res) => {
  // collection명
  const collection = myDb.collection("courses");

  const email = req.body.email;

  var result = [];

  var cursor = collection.find({ participants: { $in: [email] } });
  await cursor.forEach((doc, index, array) => {
    if (doc) {
      result.push(doc);
    }
  });

  res.status(200).send(result);
});

// send detail singleSpot
router.post("/singleSpot", async (req, res) => {
  // collection명
  const collection = myDb.collection("wishSpot");

  const email = req.body.email;

  const query = {
    region: req.body.region,
    title: req.body.title,
    address: req.body.address,
  };

  collection.findOne(
    { $and: [{ participants: { $in: [email] } }, query] },
    (err, result) => {
      if (result != null) {
        res.status(200).send(JSON.stringify(result));
      } else {
        res.status(404).send();
      }
    }
  );
});

router.post("/selectDays", (req, res) => {
  const collection = myDb.collection("selectDays");
  const query = {
    place: req.body.place,
  };

  const input = {
    place: req.body.place,
    days: req.body.days,
  };

  collection.findOne(query, (err, result) => {
    if (result != null) {
      collection.updateOne(query, { $set: { days: req.body.days } });
    } else {
      collection.insertOne(input);
    }
  });
});

router.post("/getDays", (req, res) => {
  const collection = myDb.collection("courses");
  const query = {
    title: req.body.title,
  };

  collection.findOne(query, (err, result) => {
    if (result != null) {
      const objToSend = {
        days: result.date,
        place: result.region,
      };
      res.status(200).send(JSON.stringify(objToSend));
    } else {
      res.status(404).send();
    }
  });
});

module.exports = router;
