const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const CampGround = require("../models/camgGround");
const Review = require("../models/review");
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware");

/* This is creating a new review and saving it to the database. */
router.post("/", isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await CampGround.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Review posted"); //TODO not sure i wanna keep it
    res.redirect(`/campgrounds/${ campground._id }`);
})
);

/* This is deleting the review from the campground and the review from the database. */
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await CampGround.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Deleted your review");
    res.redirect(`/campgrounds/${ id }`);
})
);

module.exports = router;
