const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true, //trims uploaded strings before adding to the db
        required: 'Please enter a store name!' // could also just put true, however it is better to put an error msg like this
    },
    slug: String,
    description: {
        type: String,
        trim: true,
    },
    tags: [String],
});

storeSchema.pre('save', function(next) {
    if (!this.isModified('name')) {
        next();  //skip it
        return;
    }
    this.slug = slug(this.name);
    next();
})

module.exports = mongoose.model('Store', storeSchema);