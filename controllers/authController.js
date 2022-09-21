// used to help with login and authentication
// we are using the "local" strategy of authentication

const passport = require('passport');

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