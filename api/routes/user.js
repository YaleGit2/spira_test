const express = require('express');
const router = express.Router();
const checkAuth = require('../utils/authMiddleware');

const userController = require('../controllers/userController');

router.post('/register', userController.userRegister);
router.get('/users', userController.userList);
router.post('/approve', checkAuth, userController.userApprove);
router.post('/update', checkAuth, userController.userUpdate);
router.post('/delete', checkAuth, userController.userDelete);
router.post('/login', userController.userLogin);

module.exports = router;
