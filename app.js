// all the imports
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const ExpressError = require("./middleware/ExpressError");
const flash = require("connect-flash");

const camps = require("./routes/campsRoutes");
const reviews = require("./routes/reviewsRoutes");

main().catch((err) => console.log("err"));
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
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
  secret: "thisissecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week in miliseconds
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/campgrounds", camps);
app.use("/campgrounds/:id/reviews", reviews);

app.get("/", (req, res) => {
  res.render("home");
});

/* Creating a new review and pushing it to the campground.reviews array. */

/* This is a catch all route that will catch any route that is not defined. */
app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

// error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "something went wrong" } = err;
  if (!err.message) err.message = "Something Went horribly wrong";
  res.status(statusCode).render("error", {
    err,
  });
  res.send("Something went wrong");
});

app.listen(PORT, () => {
  console.log(`connected to ${PORT}`);
});
