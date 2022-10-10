const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

const { isLoggedIn, validateCamp, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campsController');





router.get("/", catchAsync(campgrounds.index));

router.get("/new", isLoggedIn, campgrounds.newForm);

router.post("/", isLoggedIn, validateCamp, catchAsync(campgrounds.createCamp));

router.get("/:id", catchAsync(campgrounds.showCamp));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

router.put("/:id", isLoggedIn, isAuthor, validateCamp, catchAsync(campgrounds.updateCamp));

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCamp));

module.exports = router;
