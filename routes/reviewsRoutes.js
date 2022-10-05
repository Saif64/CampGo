const express = require("express");
const router = express.Router({ mergeParams: true });

const catchAsync = require("../middleware/catchAsync");
const ExpressError = require("../middleware/ExpressError");

const CampGround = require("../models/camgGround");
const Review = require("../models/review");
const { reviewSchema } = require("../schemas.js");

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

router.post("/", validateReview, catchAsync(async (req, res) => {
    const campground = await CampGround.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Review posted"); //TODO not sure i wanna keep it
    res.redirect(`/campgrounds/${ campground._id }`);
})
);

/* This is deleting the review from the campground and the review from the database. */
router.delete("/:reviewId", catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await CampGround.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Deleted your review");
    res.redirect(`/campgrounds/${ id }`);
})
);

module.exports = router;
