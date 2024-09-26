const express = require('express');
const router = express.Router();
const checkAuth = require('../utils/authMiddleware');

const readPointsController = require('../controllers/readPointsController');

router.get('/readPoints', checkAuth, readPointsController.readPoints);

router.get('/readPoints/:readPoint', checkAuth, readPointsController.readPointsResource);

router.get(
  '/readPoints/:readPoint/events',
  checkAuth,
  readPointsController.readPointssEvent
);

module.exports = router;