const express = require("express");
const router = express.Router();
const catchAsync = require("../middleware/catchAsync");
const ExpressError = require("../middleware/ExpressError");
const CampGround = require("../models/camgGround");
const { campgroundSchema } = require("../schemas.js");

const validateCamp = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.get("/", catchAsync(async (req, res) => {
  const campgrounds = await CampGround.find({});
  res.render("campgrounds/index", { campgrounds });
})
);

/* This is a route that is rendering the new.ejs file in the campgrounds folder. */
router.get("/new", (req, res) => {
  res.render("campgrounds/new");
});

/* Validating the data that is being sent to the server. */
router.post("/", validateCamp, catchAsync(async (req, res, next) => {
  const campground = new CampGround(req.body.campground);
  await campground.save();
  req.flash("success", "successfully made a new camp");
  res.redirect(`/campgrounds/${ campground._id }`);
})
);

router.get("/:id", catchAsync(async (req, res) => {
  const campground = await CampGround.findById(req.params.id).populate("reviews");
  if (!campground) {
    req.flash('error', 'Can not find the camp');
    return res.redirect('/campgrounds');
  }
  res.render("campgrounds/show", { campground });
})
);

router.get("/:id/edit", catchAsync(async (req, res) => {
  const campground = await CampGround.findById(req.params.id);
  if (!campground) {
    req.flash('error', 'Can not find the camp');
    return res.redirect('/campgrounds');
  }
  res.render("campgrounds/edit", { campground });
})
);

/* This is updating the campground with the new information that is being sent to the server. */
router.put("/:id", validateCamp, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await CampGround.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  req.flash("success", "successfully updated the camp");
  res.redirect(`/campgrounds/${ campground._id }`);
})
);

router.delete("/:id", catchAsync(async (req, res) => {
  const { id } = req.params;
  await CampGround.findByIdAndDelete(id);
  req.flash("success", "Deleted the camp");
  res.redirect("/campgrounds");
})
);

module.exports = router;
