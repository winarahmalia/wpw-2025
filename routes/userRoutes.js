const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/profile', userController.profile);
router.post('/update', userController.updateProfile);

module.exports = router;
