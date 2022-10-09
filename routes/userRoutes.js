const express = require('express');
const passport = require('passport');
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'welcome to CampGo');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }

}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login',
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }),
    (req, res) => {
        req.flash('success', 'welcome Back');
        const redirectUrl = req.session.returnTo || '/campgrounds';
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    });

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash('success', "You are signed out!");
        res.redirect('/campgrounds');
    });
});

module.exports = router;