const Review = require("../models/review");
const CampGround = require("../models/camgGround");

/* This is creating a new review and saving it to the database. */
module.exports.createReview = async (req, res) => {
    const campground = await CampGround.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Review posted"); //TODO not sure i wanna keep it
    res.redirect(`/campgrounds/${ campground._id }`);
};

/* This is deleting the review from the campground and the review from the database. */
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await CampGround.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Deleted your review");
    res.redirect(`/campgrounds/${ id }`);
}; 