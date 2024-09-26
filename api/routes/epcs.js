const express = require('express');
const router = express.Router();
const checkAuth = require('../utils/authMiddleware');

const epcsController = require('../controllers/epcsController');

router.get('/epcs', checkAuth, epcsController.epcs);

router.get('/epcs/:epc', checkAuth, epcsController.epcsResource);

router.get('/epcs/:epc/events', checkAuth, epcsController.epcsEvent);

module.exports = router;