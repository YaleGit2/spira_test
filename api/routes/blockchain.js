const express = require('express');
const router = express.Router();

const traceabilityController = require('../controllers/blockchainController.js');

router.get('/transactions/:id', traceabilityController.getTransaction);

module.exports = router;
