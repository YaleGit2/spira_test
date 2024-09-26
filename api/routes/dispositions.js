const express = require('express');
const router = express.Router();
const checkAuth = require('../utils/authMiddleware');

const dispositionsController = require('../controllers/dispositionsController');

router.get('/dispositions', dispositionsController.dispositions);

router.get(
  '/dispositions/:disposition',
  checkAuth,
  dispositionsController.dispositionsResource
);

router.get(
  '/dispositions/:disposition/events',
  checkAuth,
  dispositionsController.dispositionsEvent
);

module.exports = router;