const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

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
router.get('/add', storeController.addStore);
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

module.exports = router;
