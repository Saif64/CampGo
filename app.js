// all the imports
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Joi = require("joi");
const CampGround = require("./models/camgGround");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const catchAsync = require("./middleware/catchAsync");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./middleware/ExpressError");
const Review = require("./models/review");
const { log } = require("console");

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
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(methodOverride("_method"));

const validateCamp = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  // console.log(result);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await CampGround.find({});
    res.render("campgrounds/index", {
      campgrounds,
    });
  })
);

/* This is a route that is rendering the new.ejs file in the campgrounds folder. */
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

/* Validating the data that is being sent to the server. */
app.post(
  "/campgrounds",
  validateCamp,
  catchAsync(async (req, res, next) => {
    const campground = new CampGround(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const campground = await CampGround.findById(req.params.id).populate(
      "reviews"
    );
    res.render("campgrounds/show", {
      campground,
    });
  })
);

app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const campground = await CampGround.findById(req.params.id);
    res.render("campgrounds/edit", {
      campground,
    });
  })
);

app.put(
  "/campgrounds/:id",
  validateCamp,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await CampGround.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await CampGround.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

/* Creating a new review and pushing it to the campground.reviews array. */
app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await CampGround.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

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
