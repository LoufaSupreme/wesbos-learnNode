const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// router.get('/', (req, res) => {
//     // the below renders the hello.pug file, and fills in the #{variables} using the below context object   
//     res.render('hello', {
//       name: 'Cheesewiz',
//       cool: true,
//       dog: req.query.dog,
//   });
//     // res.send(req.query)
//     // res.json(req.query)
// });

// reverse any word sent in the URL, e.g. localhost:777/reverse/word --> drow
// router.get('/reverse/:word', (req, res) => {
//     res.send(...[req.params.word].reverse().join(''))
// })

router.get('/', storeController.myMiddleware, storeController.getStores);
router.get('/stores', storeController.getStores);
// go to the Add Store page
router.get('/add', authController.isLoggedIn, storeController.addStore);
router.get('/stores/:store_id/edit', storeController.editStore);

// create a new store
router.post('/add', 
    storeController.upload, 
    storeController.resize, 
    storeController.createStore);

// update an existing store
router.post('/add/:id', 
    storeController.upload, 
    storeController.resize, 
    storeController.updateStore);

// view individual store pages:
router.get('/store/:slug', storeController.getStoreBySlug);

// view the tags page which sorts stores by tag:
router.get('/tags', storeController.getStoresByTag);
router.get('/tags/:tag', storeController.getStoresByTag);

router.get('/login', userController.loginForm);
router.post('/login', authController.login);

router.get('/register', userController.registerForm);

// validate registiration data
// register user
// log them in 
router.post('/register', 
    userController.validateRegister,
    userController.register,
    authController.login,
);

router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', userController.updateAccount);

// route for when user clicks to get their password changed
router.post('/account/forgot', authController.forgot);

// route user is given to reset their password, including an automatically generated reset token
router.get('/account/reset/:token', authController.reset);
router.post('/account/reset/:token', authController.confirmedPasswords, authController.update);

// API endpoints
router.get('/api/search', storeController.searchStores);

module.exports = router;
