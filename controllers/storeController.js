
const mongoose = require('mongoose');
const Store = mongoose.model('Store');  // set in Store.js
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

exports.createStore = async (req, res) => {
    // uses the store schema (in Store.js) to create a new Store instance.
    // only uses the data in req.body that maps to the store schema.  Any other data not included in the store schema, but sent in the request anyway, will be ignored automatically.
    try {
        const store = new Store(req.body);  
        const savedStore = await store.save();
        console.log('New store created');
        req.flash('success', `Successfully created ${store.name}.  Care to leave a review?`)
        res.redirect(`/store/${savedStore.slug}`);
    }
    catch(err) {
        throw Error(err);
    }
}

exports.getStores = async (req, res) => {
    // query db for list of all stores:
    const stores = await Store.find();
    res.render('stores', { title: 'Stores', stores: stores });
}

exports.editStore = async (req, res) => {
    // find the store given the ID
    const store_id = req.params.store_id;
    const store = await Store.findOne({ _id: store_id });
    
    // confirm they are the ownder of the store

    // render out the edit form so the user can update their store
    res.render('editStore', { title: `Edit ${store.name}`, store: store })
}

exports.updateStore = async (req, res) => {
    // set the location data to be a point 
    // need to do this manually since findOneandUpdate doesn't take into account the schema defaults
    // note however that creating a store does take into account the schema defaults, so this isn't needed in the createStore function
    req.body.location.type = 'Point';

    // find and update the store
    const store = await Store.findOneAndUpdate({_id: req.params.id }, req.body, { 
        new: true, // return newly updated store, not the old unupdated version
        runValidators: true, // forces validation of the options set in the Store model, e.g. required:true for name and trim:true for description, etc
    }).exec(); // runs the query

    req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store </a>`);
    res.redirect(`/stores/${store._id}/edit`);

    // redirect to store and flash success msg
}

exports.getStoreBySlug = async (req, res, next) => {
    const store = await Store.findOne({ slug: req.params.slug });
    if (!store) {
        return next();  // sends the program to the next function in app.js, which is the "app.use(errorHandlers.notFound)"
    }
    res.render('store', { store: store, title: store.name })
}