const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema({
    created: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: "You must supply an author!"
    },
    store: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: "You must supply a store!"
    },
    text: {
        type: String,
        required: "Your review must have content..."
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    }
});

// populates the author data for each review
// so instead of just having author: 4987239847293842, we have author: { name: Josh, email: josh.davi.... } etc
function autoPopulate(next) {
    this.populate('author');
    next();
}

// run autopopulate everytime we find or findOne review
reviewSchema.pre('find', autoPopulate);
reviewSchema.pre('findOne', autoPopulate);

module.exports = mongoose.model('Review', reviewSchema);