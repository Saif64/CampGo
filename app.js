// all the imports
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const CampGround = require("./models/camgGround");

main().catch((err) => console.log(err));
/**
 * This function connects to the MongoDB database and returns a promise that resolves when the
 * connection is established.
 */
async function main() {
  await mongoose.connect("mongodb://localhost:27017/campGo");
}

const db = mongoose.connection;

/* Checking if there is an error connecting to the database. If there is an error, it will log the
error. If there is no error, it will log that it is connected to the database. */
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("connected to database");
});

const app = express();
const PORT = 3000;

/* This is setting the view engine to ejs and setting the views directory to the views folder. */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/makecampground", async (req, res) => {
  const camp = new CampGround({
    title: "My BackYard",
    description: "cheap price but good place",
  });
  await camp.save();
  res.send(camp);
});

app.listen(PORT, () => {
  console.log(`connected to ${PORT}`);
});
