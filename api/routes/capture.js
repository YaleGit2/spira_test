const express = require('express');
const router = express.Router();
const checkAuth = require('../utils/authMiddleware');

const capture_controller = require('../controllers/captureController.js');

router.get('/capture', checkAuth, capture_controller.captureGet);

router.get('/capture/:captureID', checkAuth, capture_controller.captureGetId);

router.post('/capture', checkAuth, capture_controller.capture);

module.exports = router;
