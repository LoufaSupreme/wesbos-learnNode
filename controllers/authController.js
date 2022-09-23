// used to help with login and authentication
// we are using the "local" strategy of authentication

const passport = require('passport');
const User = require('../models/User');
const crypto = require('crypto');  // built in Node module that generates token strings
const promisify = require('es6-promisify');

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Login',
    successRedirect: '/',
    successFlash: 'You are now logged in!',
})

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out!');
    res.redirect('/');
}

// middleware that checks if user is logged in
// used in the '/add' route
exports.isLoggedIn = (req, res, next) => {
    // check if user is authenticated
    if (req.isAuthenticated()) { // uses passport
        next();
        return;
    } 
    req.flash('error', 'Ooops, you must be logged in to do this!');
    res.redirect('/login');
}

// if user forgets password and requests to change it
exports.forgot = async (req, res) => {
    try {
        // see if user w/ that email exists
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            req.flash('error', 'No account with that email exists');
            return res.redirect('/login');
        }
        
        // set reset tokens and expiry on their account
        user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hr time limit
        await user.save();
        
        // send them an email with the token
        // req.headers.host will give you the domain name of the website.  For dev it will be localhost:PORT but for production it will figure it out
        const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
        req.flash('success', `You have been emailed a password reset link. ${resetURL}`);
        
        // redirect to login page
        res.redirect('/login');
    }
    catch(err) {
        throw Error(err);
    }
}

// reset a user password
exports.reset = async (req, res) => {
    try {
        // find user with this reset token, and check that it hasn't expired
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired');
            return res.redirect('/login');
        }
        res.render('reset', { title: 'Reset your password' });
    }
    catch(err) {
        throw Error(err);
    }
}

// confirm that password and confirm-password fields match, when user requests to change password
exports.confirmedPasswords = (req, res, next) => {
    if (req.body.password === req.body["password-confirm"]) {
        next();
        return;
    }
    req.flash('error', 'Passwords do not match');
    res.redirect('back');
}

// update user password in db:
exports.update = async (req, res) => {
    try {
        // find user with this reset token, and check that it hasn't expired
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired');
            return res.redirect('/login');
        }

        // update the users password
        // this function is made availabilty to us from passport. not promised based, need to promisify
        // note that before when we promisified a function (in userController.js) we did it on User (uppercase) and then called the function on user. 
        // for some reason, we can't write it that way this time.  Have to only use lower case user here...
        const setPassword = promisify(user.setPassword, user);
        await setPassword(req.body.password)
        
        // remove the reset token fields from the user
        // mongodb will delete fields that are undefined
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        // save to db
        const updatedUser = await user.save();

        // login the user
        await req.login(updatedUser); // from passport.js
        req.flash('success', 'Nice!  Password reset!');
        res.redirect('/');
    }
    catch(err) {
        throw Error(err);
    }
}