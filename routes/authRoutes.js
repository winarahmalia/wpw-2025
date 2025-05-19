const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/', authController.showLogin);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/login', authController.getLoginPage);

router.get('/register', authController.getRegisterPage);
router.post('/register', authController.postRegister);

module.exports = router;
//cobaaa push