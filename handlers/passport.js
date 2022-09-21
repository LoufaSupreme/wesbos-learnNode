// configures passport

const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

passport.use(User.createStrategy());  // can do this b/c we included the passportLocalMongoose plugin in User.JS

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());