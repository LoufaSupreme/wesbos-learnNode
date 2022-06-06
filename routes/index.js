const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// router.get('/', (req, res) => {
//   res.render('hello', {
//       name: 'Cheesewiz',
//       cool: true,
//       dog: req.query.dog,
//   });
// });

router.get('/', storeController.homePage);

module.exports = router;
