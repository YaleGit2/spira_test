const express = require('express');
const router = express.Router();
const checkAuth = require('../utils/authMiddleware');

const query_controller = require('../controllers/queriesController');
const subscriptions_controller = require('../controllers/subscriptionsController');

router.options('/queries', checkAuth, query_controller.queriesOptions);

router.get('/queries', checkAuth, query_controller.queriesGet);

router.post('/queries', checkAuth, query_controller.queriesPost);

router.get('/queries/:queryName', checkAuth, query_controller.queriesQueryNameGet);

router.delete('/queries/:queryName', checkAuth, query_controller.queriesQueryNameDelete);

router.get(
  '/queries/:queryName/events',
  checkAuth,
  query_controller.queriesQueryNameEventGet
);

router.get(
  '/queries/:queryName/subscriptions',
  checkAuth,
  subscriptions_controller.queryNameSubscriptionsGet
);

router.post(
  '/queries/:queryName/subscriptions',
  checkAuth,
  subscriptions_controller.queryNameSubscriptionsPost
);

router.get(
  '/queries/:queryName/subscriptions/:subscriptionID',
  checkAuth,
  subscriptions_controller.queryNameSubscriptionsWithIDGet
);

router.delete(
  '/queries/:queryName/subscriptions/:subscriptionID',
  checkAuth,
  subscriptions_controller.queryNameSubscriptionsWithIdDelete
);

module.exports = router;
