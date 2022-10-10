const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

const { isLoggedIn, validateCamp, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campsController');


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, validateCamp, catchAsync(campgrounds.createCamp));

router.get("/new", isLoggedIn, campgrounds.newForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCamp))
    .put(isLoggedIn, isAuthor, validateCamp, catchAsync(campgrounds.updateCamp))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCamp));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;
