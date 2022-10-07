const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');  // for gravatar - hashes users email address
const validator = require('validator');
const mongodbErrorHandler = require ('mongoose-mongodb-errors'); // improves on the native mongodb error messages, particularly for unique: true errors
const passportLocalMongoose = require('passport-local-mongoose'); // tool for authentication

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Invalid Email Address'],
        required: 'Please supply an email address'
    },
    name: {
        type: String,
        required: 'Please supply a name',
        trim: true,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    hearts: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Store',
        }
    ]
},
// add additional option to display virtual fields (like our gravatar field) when displaying store data in JSON or as objects.
// without this, virtual fields would still be present, but they wouldn't be displayed when using res.json(), for example. 
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// gravator = globally recognized avatar
// use a virtual field to store the user profile pic
// this allows us to not store the actual image in the db
// this function is called in layout.pug "img.avatar(src=user.gravatar + '&d=retro')"
userSchema.virtual('gravatar').get(function() {
    const hash = md5(this.email);
    return `https://gravatar.com/avatar/${hash}?s=200`;
})

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler)

module.exports = mongoose.model('User', userSchema);