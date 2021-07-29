const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  // console.log("/");
  res.send("Hello World!");
});

//user routing
var user = require("./routes/user");
app.use("/user", user);

//spot routing
var course = require("./routes/course");
app.use("/course", course);

//image routing
var image = require("./routes/image");
app.use("/image", image);

//search routing
var search = require("./routes/search");
app.use("/search", search);

app.listen(80, () => {
  console.log("Listening on port 80...");
});
