const mongoose = require('mongoose');
const User = mongoose.model('User');  // imported in start.js
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
    res.render('login', { title: 'Login' });
}

exports.registerForm = (req, res) => {
    res.render('register', { title: 'Register' });
}

// MIDDLEWARE:

// uses expressValidator that was imported into app.js and validator inported into User.js
exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name'); 
    req.checkBody('name', 'You must supply a name!').notEmpty();
    req.checkBody('email', 'That email is not valid!').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false,
    });
    req.checkBody('password', 'Password cannot be blank!').notEmpty();
    req.checkBody('confirm-password', 'Confirmed password cannot be blank!').notEmpty();
    req.checkBody('confirm-password', 'Your passwords do not match!').equals(req.body.password);

    const errors = req.validationErrors();
    if (errors) {
        req.flash('error', errors.map(err => err.msg));
        res.render('register', { title: 'Register', body: req.body, flashes: req.flash() })  // explicitly pass the flashes so that they show up on THIS render, not the next one
        return;
    };
    next();
}

exports.register = async (req, res, next) => {
    try {
        const user = new User({ email: req.body.email, name: req.body.name });
        // the User.register method comes from the passportLocalMongoose plugin that we added in User.js
        // it helps with password hashing or something
        // need to promisify it first b/c this library is a bit outdated and uses callbacks instead of promises by default
        const mongooseRegister = promisify(User.register, User);
        await mongooseRegister(user, req.body.password);
        next();  // pass to authController.login
    }
    catch(err) {
        throw Error(err);
    }
};

exports.account = (req, res) => {
    res.render('account', {title: 'Edit Your Account'});
}

exports.updateAccount = async (req, res) => {
    try {
        const updates = {
            name: req.body.name,
            email: req.body.email,
        };

        const user = await User.findOneAndUpdate(
            { _id: req.user._id },
            { $set: updates },
            { new: true, runValidators: true, context: 'query' }
        );

        req.flash('success', 'Updated your profile!');
        res.redirect('back');
    }
    catch(err) {
        throw Error(err);
    }
}