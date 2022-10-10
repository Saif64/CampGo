const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

/* The above code is registering a new user. */
module.exports.registerUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', `welcome to CampGo ${ username }`);
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

/* This is the code that is logging in the user. */
module.exports.loginUser = (req, res) => {
    const { username } = req.body;
    req.flash('success', `welcome Back ${ username }`);
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

/* This is the code that is logging out the user. */
module.exports.logoutUser = (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash('success', "You are signed out!");
        res.redirect('/campgrounds');
    });
};