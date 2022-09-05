
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

exports.createStore = (req, res) => {
    res.json(req.body)
}