const express = require('express');
const router = express.Router();
const checkAuth = require('../utils/authMiddleware');

const bizLocationsController = require('../controllers/bizLocationsController');

router.get('/bizLocations', bizLocationsController.bizLocations);

router.get(
  '/bizLocations/:bizLocation',
  checkAuth,
  bizLocationsController.bizLocationsResource
);

router.get(
  '/bizLocations/:bizLocation/events',
  checkAuth,
  bizLocationsController.bizLocationsEvent
);

module.exports = router;

//eventTypes   eventTypeResource  eventTypeEvent
