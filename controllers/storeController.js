const mongoose = require('mongoose');
const Store = mongoose.model('Store');  // set in Store.js
const User = mongoose.model('User');  // set in User.js
const multer = require("multer"); // package for uplaoding multiple files.  Needed since our _storeForm.pug has a form w/ enctype=multipart/form-data
const jimp = require("jimp"); // for image uploads
const uuid = require("uuid"); // helps with making unique file names for uploaded files (to avoid duplicates)


const multerOptions = {
    storage: multer.memoryStorage(),  // initially load file into local memory
    fileFilter: function(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto) {
            next(null, true);
        }
        else {
            next({ message: "That filetype isn't allowed!"}, false);
        }
    }
}

exports.upload = multer(multerOptions).single('photo')

exports.resize = async (req, res, next) => {
    try {
        // check if there is no new file to resize
        if (!req.file) {
            next(); // skip to next middleware
            return;
        }
        // console.log(req.file);
        const fileExtension = req.file.mimetype.split('/')[1]; // get the type of image
        req.body.photo = `${uuid.v4()}.${fileExtension}`; // create a new unique name for the image
        // resize photo:
        const photo = await jimp.read(req.file.buffer); // pass in image buffer to jimp
        await photo.resize(800, jimp.AUTO); // length and width
        await photo.write(`./public/uploads/${req.body.photo}`);  // save the resized image to the public folder
        next(); 
    }
    catch(err) {
        next(err);
    }
}

exports.myMiddleware = (req, res, next) => {
    // req.name = 'Josh';
    // if (req.name === 'Josh') {
    //     throw Error("That's a stupid name...");
    // }
    next();
}

exports.homePage = (req, res) => {
    // console.log(`Middleware did this: Name=${req.name}`)
    console.log('Rendering index.pug!!');
    res.render('index');
}

exports.addStore = (req, res) => {
    res.render('editStore', {
        title: 'Add Store',
    })
}

exports.createStore = async (req, res, next) => {
    // uses the store schema (in Store.js) to create a new Store instance.
    // only uses the data in req.body that maps to the store schema.  Any other data not included in the store schema, but sent in the request anyway, will be ignored automatically.
    try {
        req.body.author = req.user._id;
        const store = new Store(req.body);  
        const savedStore = await store.save();
        console.log('New store created');
        req.flash('success', `Successfully created ${store.name}.  Care to leave a review?`)
        res.redirect(`/store/${savedStore.slug}`);
    }
    catch(err) {
        next(err);
    }
}

exports.getStores = async (req, res, next) => {
    try {
        // query db for list of all stores:
        const stores = await Store.find();
        res.render('stores', { title: 'Stores', stores: stores });
    }
    catch(err) {
        next(err);
    }
}

// check if the user is the author of the store they are trying to edit:
const confirmOwner = (store, user) => {
    // author.equals is a built in method to compare mongo's ObjectIds
    if (!store.author.equals(user._id)) {
        return false;
    }
    return true;
}

exports.editStore = async (req, res, next) => {
    try {
        // find the store given the ID
        const store_id = req.params.store_id;
        const store = await Store.findOne({ _id: store_id });

        // confirm they are the ownder of the store
        if (!confirmOwner(store, req.user)) {
            req.flash('error', 'You need to own the store to edit it!');
            res.redirect('back');
            return;
        };

        // render out the edit form so the user can update their store
        res.render('editStore', { title: `Edit ${store.name}`, store: store })
    }
    catch(err) {
        next(err);
    }
    
}

exports.updateStore = async (req, res, next) => {
    try {
        // set the location data to be a point 
        // need to do this manually since findOneandUpdate doesn't take into account the schema defaults
        // note however that creating a store does take into account the schema defaults, so this isn't needed in the createStore function
        req.body.location.type = 'Point';

        // find and update the store
        const store = await Store.findOneAndUpdate({_id: req.params.id }, req.body, { 
            new: true, // return newly updated store, not the old unupdated version
            runValidators: true, // forces validation of the options set in the Store model, e.g. required:true for name and trim:true for description, etc
        }).exec(); // runs the query
        
        // redirect to store and flash success msg
        req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/store/${store.slug}">View Store </a>`);
        res.redirect(`/stores/${store._id}/edit`);
    }
    catch(err){
        next(err);
    }
}

exports.getStoreBySlug = async (req, res, next) => {
    try {
        // .populate('author') will replace the author _id with all the authors info (from the User schema).
        // without populating we would only get the authors _id number
        const store = await Store.findOne({ slug: req.params.slug }).populate('author');
        if (!store) {
            return next();  // sends the program to the next function in app.js, which is the "app.use(errorHandlers.notFound)"
        }
        res.render('store', { store: store, title: store.name });
    }
    catch(err) {
        next(err);
    }    
}

exports.getStoresByTag = async (req, res, next) => {
    try {
        const tag = req.params.tag;
        
        // get a list of of the tags, with their count of how many stores are tagged with that tag
        const tagsPromise = Store.getTagsList();

        // get a list of stores that have the target tag, or if there isnt a target tag, get a list of all the stores with ANY tag
        const tagQuery = tag || { $exists: true };
        const storesPromise = Store.find({ tags: tagQuery });

        // do both promises concurrently and await them both
        const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

        // res.json(result) // print out response in json format
        res.render('tag', { tags: tags, tag: tag, stores: stores, title: 'Tags' });
    }
    catch(err) {
        next(err);
    }
}

// seach for stores with the query text in the name or description:
exports.searchStores = async (req, res, next) => {
    try {
        const stores = await Store
            .find({
                // can perform a $text query on the db b/c we indexed the name and description as text in Store.js (storeScheme.index...)
                $text: {
                    $search: req.query.q,
                }
            }, 
            // and then "project" (i.e. temporarily add an additional field to the returned data) that indicates how relevant the result is to the search query
            // we will assign a "score" using mongo's built in 'textScore' metadata
            {
                score: { $meta: 'textScore' }
            })
            // sort by descrending textScore
            .sort({ score: { $meta: 'textScore' }})
            // limit to first 5 results
            .limit(5);
        res.json(stores)
    }
    catch(err) {
        console.log('There was an error in searchStores:', err);
        next(err);
    }
}

// find all stores within 10km of target lat/lng
// remember: mongo expects coords to be in [lng, lat] format
exports.mapStores = async (req, res, next) => {
    try {
        const coords = [req.query.lng, req.query.lat].map(parseFloat);
        const query = {
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: coords,
                    },
                    $maxDistance: 10000 // 10km
                }
            }
        }
        // .select lets us pick and choose which fields we want to return
        const stores = await Store.find(query).select('slug name description location photo');
        res.json(stores);
    }
    catch(err) {
        next(err);
    }
}

// show a map of all the stores
exports.mapPage = (req, res) => {
    res.render('map', { title: 'Map' });
}

// heart a store:
// adds the store ID to the user object, under the hearts field
exports.heartStore = async (req, res, next) => {
    try {
        const hearts = req.user.hearts.map(obj => obj.toString()) // convert user IDs (which are mongodb ObjectIds) to strings
        const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
        const user = await User.findByIdAndUpdate(req.user._id, 
            { [operator]: { hearts: req.params.id } }, 
            { new: true }
        );
        res.json(user)
    }
    catch(err) {
        next(err);
    }
}

// show hearted stores
exports.getHearts = async (req, res, next) => {
    try {
        const stores = await Store.find({
            _id: { $in: req.user.hearts }, // checks if a store _id is in the array of hearted stores on the user object
        });
        res.render('stores', { title: 'Hearted Stores', stores: stores });
    }
    catch(err) {
        next(err);
    }
}