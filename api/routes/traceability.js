const express = require('express');
const router = express.Router();
const checkAuth = require('../utils/authMiddleware');

const traceabilityController = require('../controllers/traceabilityController.js');

router.get('/traceability/products', traceabilityController.getProduct);
router.get('/traceability/products/check', traceabilityController.checkProductList);
//router.post('/traceability/', checkAuth, traceabilityController.addEvent);
console.log("Yalew Update this to bypass the security")
router.post('/traceability/', traceabilityController.addEvent);

module.exports = router;
