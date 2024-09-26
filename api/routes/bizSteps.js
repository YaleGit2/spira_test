const express = require('express');
const router = express.Router();
const checkAuth = require('../utils/authMiddleware');

const bizStepsController = require('../controllers/bizStepsController.js');

router.get('/bizSteps', checkAuth, bizStepsController.bizSteps);

router.get('/bizSteps/:bizStep', checkAuth, bizStepsController.bizStepsResource);

router.get('/bizSteps/:bizStep/events', checkAuth, bizStepsController.bizStepsEvent);

module.exports = router;