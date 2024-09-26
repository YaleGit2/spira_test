const express = require('express');
var cors = require('cors');

//To call all configuration files
require('dotenv').config({ path: './config/.env' });

const websocketController = require('./controllers/subscriptionWebsocketController');
const networkcontract = require('./networkContract');

var express_app = express();

const server = require('http').createServer(express_app);
const WebSocket = require('ws');

const wss = new WebSocket.Server({ server: server }); 

const bcrypt = require('bcrypt');
const userdb = require('./utils/userDBInit');
const capture_router = require('./routes/capture.js');
const event_router = require('./routes/event.js');
const eventTypes_router = require('./routes/eventTypes.js');
const epcs_router = require('./routes/epcs.js');
const bizSteps_router = require('./routes/bizSteps.js');
const bizLocations_router = require('./routes/bizLocations');
const readPoints_router = require('./routes/readPoints');
const dispositions_router = require('./routes/dispositions');
const queries_router = require('./routes/queries');
const vocabularies_router = require('./routes/vocabularies');
const traceabilityRouter = require('./routes/traceability');
const blockchainRouter = require('./routes/blockchain');
const userRouter = require('./routes/user');

let PORT = 7080; //8090;

MONGODB_SERVER_URL = process.env.MONGODB_SERVER_URL;
MONGODB_SERVER_PORT = process.env.MONGODB_SERVER_PORT;
MONGODB_EPCIS_COLLECTION = process.env.MONGODB_EPCIS_COLLECTION;

async function initUserDB() {
  await userdb.createUserDB();
  await userdb.createAdminIfNotExist();
}

initUserDB();

express_app.use(cors()); // Allow all origins

express_app.use(express.json());

ROOT_END_POINT = process.env.ROOT_END_POINT;
networkcontract.getcontractGateway().then((blockchain) => {
  express_app.use((req, res, next) => {
    req.blockchain = blockchain;
    next();
  });
  express_app.use(ROOT_END_POINT, capture_router);
  express_app.use(ROOT_END_POINT, event_router);
  express_app.use(ROOT_END_POINT, eventTypes_router);
  express_app.use(ROOT_END_POINT, epcs_router);
  express_app.use(ROOT_END_POINT, bizSteps_router);
  express_app.use(ROOT_END_POINT, bizLocations_router);
  express_app.use(ROOT_END_POINT, readPoints_router);
  express_app.use(ROOT_END_POINT, dispositions_router);
  express_app.use(ROOT_END_POINT, queries_router);
  express_app.use(ROOT_END_POINT, vocabularies_router);
  express_app.use(ROOT_END_POINT, blockchainRouter);
  express_app.use(ROOT_END_POINT, traceabilityRouter);
});

express_app.use('/', userRouter);

express_app.disable('x-powered-by');

wss.on('connection', function connection(ws, request) {
  websocketController.getWebscoket(wss);
  websocketController.handleWebSocketRequest(ws, request);
});

server.listen(PORT, () => {
  console.log('EPCIS Server Started');
  console.log('EPCIS Server running on port ', PORT);
  console.log(
    'Send GET Request to',
    ROOT_END_POINT,
    ' to get more information'
  );
});