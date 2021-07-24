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

// saveCourse
router.post("/saveCourse", async (req, res) => {
  // collection명
  const collection = myDb.collection("courses");

  const locations = req.body.locations;

  console.log(req.body);

  const newCourse = {
    email: req.body.email,
    region: req.body.region,
    totalSize: req.body.totalSize,
    title: req.body.title,
    locations: req.body.locations,
  };

  console.log(newCourse.totalSize);

  await collection.insertOne(newCourse, (err, result) => {
    if (err) {
      console.log("course already exists");
    }
  });

  const spotCol = myDb.collection("wishSpot");

  await locations.forEach((el) => {
    const newSpot = {
      email: newCourse.email,
      region: newCourse.region,
      title: newCourse.title,
      address: el.address,
      latitude: el.latitude,
      longtitude: el.longtitude,
    };

    spotCol.insertOne(newSpot, (err, result) => {
      if (err) {
        console.log("spot already exists");
      }
    });
  });

  res.status(200).send();
});

// send courseList
router.post("/courseList", async (req, res) => {
  // collection명
  const collection = myDb.collection("courses");

  const query = {
    email: req.body.email,
  };

  var result = [];

  var cursor = collection.find(query);
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

  const query = {
    email: req.body.email,
    region: req.body.region,
    title: req.body.title,
    address: req.body.address,
  };

  collection.findOne(query, (err, result) => {
    if (result != null) {
      // 아직 미완성 // 메모, 사진 업로드 하고 다시 수정해야함!!!
      const objToSend = {};
      res.status(200).send(JSON.stringify(objToSend));
    } else {
      res.status(404).send();
    }
  });
});

module.exports = router;
