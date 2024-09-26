const express = require('express');
const router = express.Router();
const checkAuth = require('../utils/authMiddleware');

const vocabulary_controller = require('../controllers/vocabularyController.js');

router.get('/vocabularies', checkAuth, vocabulary_controller.vocabularyGet);

module.exports = router;