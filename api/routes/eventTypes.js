const express = require('express');
const router = express.Router();
const checkAuth = require('../utils/authMiddleware');

const eventTypesController = require('../controllers/eventTypesController.js');

router.options('/eventTypes', () => '');
router.options('/eventTypes/:eventType', () => '');
router.get('/eventTypes', checkAuth, eventTypesController.eventTypes);
router.get('/eventTypes/:eventType', checkAuth, eventTypesController.eventTypeResource);
router.get(
  '/eventTypes/:eventType/events',
  checkAuth,
  eventTypesController.eventTypeEvent
);

module.exports = router;
