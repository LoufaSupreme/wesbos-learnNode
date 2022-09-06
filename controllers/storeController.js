
const mongoose = require('mongoose');
const Store = mongoose.model('Store');  // set in Store.js

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