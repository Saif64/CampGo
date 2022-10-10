const express = require('express');
const passport = require('passport');
const router = express.Router();
const users = require('../controllers/usersController');
const catchAsync = require("../utils/catchAsync");


router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.registerUser));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate(
        'local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }),
        users.loginUser);

router.get('/logout', users.logoutUser);

module.exports = router;