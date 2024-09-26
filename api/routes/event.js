const express = require('express');
const router = express.Router();
const checkAuth = require('../utils/authMiddleware');

const event_controller = require('../controllers/eventController.js');

router.get('/events', event_controller.eventGet);
router.get('/events/block', event_controller.eventGetBlock);
//router.post('/events', checkAuth, event_controller.eventPost);
router.post('/events', event_controller.eventPost);
router.post('/events/blocktest', checkAuth, event_controller.blockChainHashTest);

module.exports = router;
