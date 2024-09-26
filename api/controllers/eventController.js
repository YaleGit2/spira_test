const extensions = require('../config/extensions.js');
require('dotenv').config({ path: './config/.env' });
const { checkQueryParameter } = require('../utils/commonUtils.js');
const queryUtilis = require('../utils/queryUtils.js');
const cash = require('../utils/cacheVariables');

const RED = '\x1b[31m\n';
const GREEN = '\x1b[32m\n';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

const validator = require('../validators/epcisValidator.js');

const { v4: uuidv4 } = require('uuid');

async function addContractListenerLocal() {
  if (typeof contract == 'undefined') {
    await evaluateContract();
  }
  listener = async (event) => {
    const asset = JSON.parse(event.payload.toString());
    console.log(
      `${GREEN}<-- Contract Event Received: ${
        event.eventName
      } - ${JSON.stringify(asset)}${RESET}`
    );
  };
  // now start the client side event service and register the listener
  console.log(
    `${GREEN}--> Start contract event stream to peer in Org1${RESET}`
  );
  await contract.addContractListener(listener);
}

exports.blockChainTest = async (req, res) => {
  if (typeof contract == 'undefined') {
    await evaluateContract();
  }
  await contract.submitTransaction(
    'CreateAsset',
    req.body.id,
    'yellow',
    '5',
    'Tom',
    '1300'
  );
  return res.status(202).json([]);
};
exports.blockChainHashTest = async (req, res) => {
  if (typeof contract == 'undefined') {
    await evaluateContract();
  }
  await contract.submitTransaction('CaptureEventHash', req.body.id);
  return res.status(202).json([]);
};

exports.eventPost = async (req, res) => {
  console.log("Yo test")
  try {
    const contract = req.blockchain.epcisContract;
    res.set({
      'GS1-EPCIS-Version': '2.0',
      'GS1-CBV-Version': '2.0',
      'GS1-Extensions': extensions.GS1Extensions,
      Location: process.env.ROOT_END_POINT + '/capture/' + 'EventID',
    });
    const [queryCheck, queryCheckError] = checkQueryParameter(req.query);
    if (!queryCheck) {
      console.log('validation error', queryCheckError);
      res.status(400).send(queryCheckError);
      return;
    }
    let event = req.body;

    const [valStatus, valEror] = validator.epcValidate(event);
    if (!valStatus) {
      console.log('validation error', valEror);
      res.status(400).send(valEror);
      return;
    }

    if (event.type === 'EPCISDocument' || event.type === 'EPCISQueryDocument') {
      return res.status(400).json({
        type: 'epcisException:ValidationException',
        title: 'EPCIS query exception',
        status: 400,
        detail: event.type + ' is captured using /capture end point',
      });
    }

    let contextG = {};
    if (typeof event['@context'] !== 'undefined') {
      const epcisDocument_context = event['@context'];
      for (var attributename in epcisDocument_context) {
        if (typeof epcisDocument_context[attributename] === 'object') {
          for (var nested in epcisDocument_context[attributename]) {
            contextG[nested] = epcisDocument_context[attributename][nested];
          }
        }
      }
    }

    delete event['@context'];
    event.context = contextG;
    event.docType = 'event';

    //set event record time
    event.recordTime = new Date().toJSON();

    //Handling eventType
    if (typeof event.type !== 'undefined') {
      //console.log("cash.eventType : ", cash.eventType)
      if (!cash.eventType.includes(event.type)) {
        var contextval = {};
        const extntion = event.type.split(':');
        if (extntion.length > 1) {
          Object.keys(contextG).forEach(function (key) {
            if (key == extntion[0]) {
              contextval[extntion[0]] = contextG[key];
            }
          });
        }
        let vocab = {};
        vocab.ID = uuidv4();
        vocab.docType = 'eventType';
        vocab.voc = event.type;
        vocab.context = contextval;
        const vocabString = JSON.stringify(vocab);

        console.log('\n--> Submit Transaction: capture vocabulary type');
        const response = await contract.submitTransaction(
          'CaptureVocabulary',
          vocabString
        );
        console.log('*** Result: committed', JSON.parse(response));
        cash.eventType.push(event.type);
      }
    }

    //Handling bizStep
    if (typeof event.bizStep !== 'undefined') {
      if (!cash.bizStep.includes(event.bizStep)) {
        var contextval = {};
        const extntion = event.bizStep.split(':');
        if (extntion.length > 1) {
          Object.keys(contextG).forEach(function (key) {
            if (key == extntion[0]) {
              contextval[extntion[0]] = contextG[key];
            }
          });
        }

        let vocab = {};
        vocab.ID = uuidv4();
        vocab.docType = 'bizStep';
        vocab.voc = event.bizStep;
        vocab.context = contextval;
        const vocabString = JSON.stringify(vocab);
        console.log('\n--> Submit Transaction: capture vocabulary bizStep');
        const response = await contract.submitTransaction(
          'CaptureVocabulary',
          vocabString
        );
        console.log('*** Result: committed', JSON.parse(response));

        cash.bizStep.push(event.bizStep);
      }
    }

    //Handling disposition
    if (typeof event.disposition !== 'undefined') {
      if (!cash.disposition.includes(event.disposition)) {
        var contextval = {};
        const extntion = event.disposition.split(':');
        if (extntion.length > 1) {
          Object.keys(contextG).forEach(function (key) {
            if (key == extntion[0]) {
              contextval[extntion[0]] = contextG[key];
            }
          });
        }

        let vocab = {};
        vocab.ID = uuidv4();
        vocab.docType = 'disposition';
        vocab.voc = event.disposition;
        vocab.context = contextval;
        const vocabString = JSON.stringify(vocab);
        console.log('\n--> Submit Transaction: capture vocabulary disposition');
        const response = await contract.submitTransaction(
          'CaptureVocabulary',
          vocabString
        );
        console.log('*** Result: committed', JSON.parse(response));

        cash.disposition.push(event.disposition);
      }
    }

    //Handling bizLocation
    if (typeof event.bizLocation !== 'undefined') {
      if (!cash.bizLocation.includes(event.bizLocation.id)) {
        let vocab = {};
        vocab.ID = uuidv4();
        vocab.docType = 'bizLocation';
        vocab.voc = event.bizLocation.id;
        const vocabString = JSON.stringify(vocab);
        console.log('\n--> Submit Transaction: capture vocabulary bizLocation');
        const response = await contract.submitTransaction(
          'CaptureVocabulary',
          vocabString
        );
        console.log('*** Result: committed', JSON.parse(response));
        //bizLocations.collection.updateOne({ bizLoc: event.bizLocation.id }, { $setOnInsert: { bizLoc: event.bizLocation.id } }, { upsert: true });
        cash.bizLocation.push(event.bizLocation.id);
      }
    }
    //Handling readPoint
    if (typeof event.readPoint !== 'undefined') {
      if (!cash.readPoint.includes(event.readPoint.id)) {
        let vocab = {};
        vocab.ID = uuidv4();
        vocab.docType = 'readPoint';
        vocab.voc = event.readPoint.id;
        const vocabString = JSON.stringify(vocab);
        console.log('\n--> Submit Transaction: capture vocabulary readPoint');
        const response = await contract.submitTransaction(
          'CaptureVocabulary',
          vocabString
        );
        console.log('*** Result: committed', JSON.parse(response));
        //readPoints.collection.updateOne({ readPoint: event.readPoint.id }, { $setOnInsert: { readPoint: event.readPoint.id } }, { upsert: true });
        cash.readPoint.push(event.readPoint.id);
      }
    }

    //Handling epcs
    let epcsList = [];
    if (typeof event.epcList !== 'undefined') {
      for (const epc in event.epcList) {
        for (const epc in event.epcList) {
          epcsList.push({ EPC: event.epcList[epc] });
        }
        //epcs.collection.insertOne({"_id":event.epcList[epc], "EPC":event.epcList[epc]}, function (err, docs) {});
      }
    }
    if (typeof event.parentID !== 'undefined') {
      epcsList.push({ EPC: event.parentID });
    }
    if (typeof event.childEPCs !== 'undefined') {
      for (const epcChild in event.childEPCs) {
        epcsList.push({ EPC: event.childEPCs[epcChild] });
      }
    }
    if (typeof event.inputEPCList !== 'undefined') {
      for (const epcInList in event.inputEPCList) {
        epcsList.push({ EPC: event.inputEPCList[epcInList] });
      }
    }
    if (typeof event.outputEPCList !== 'undefined') {
      for (const epcOutList in event.outputEPCList) {
        epcsList.push({ EPC: event.outputEPCList[epcOutList] });
      }
    }

    epcsList.forEach(async (epcElement) => {
      if (!cash.epcsList.includes(epcElement.EPC)) {
        let vocab = {};
        vocab.ID = uuidv4();
        vocab.docType = 'epc';
        vocab.voc = epcElement.EPC;
        const vocabString = JSON.stringify(vocab);
        console.log('\n--> Submit Transaction: capture vocabulary EPC');
        const response = await contract.submitTransaction(
          'CaptureVocabulary',
          vocabString
        );
        console.log('*** Result: committed', JSON.parse(response));
        //epcs.collection.updateOne({ epc: epcElement.EPC }, { $setOnInsert: { epc: epcElement.EPC } }, { upsert: true })
        cash.epcsList.push(epcElement.EPC);
      }
    });

    const args = JSON.stringify(event);
    //console.log("args : ", args)

    //CaptureEvent
    const response = await contract.submitTransaction('CaptureEvent', args);
    console.log('*** Result: committed events', JSON.parse(response));

    const resposneText = 'Successfully captured one ' + event.type;
    res.set({
      Location: process.env.ROOT_END_POINT + '/capture/' + event.eventID,
    });
    res.status(202).send(resposneText);
  } catch (error) {
    console.log(error);
    console.log({ message: error.message });
    res.status(400).send(error.message);
  }
};

exports.eventGet = async (req, res) => {
  queryUtilis.getQueryResult(req, res);
};

exports.eventGetBlock = async (req, res) => {
  let result = await getBlocks();
  console.log('result : ', result);
  return;
  queryUtilis.getQueryResultBlock(req, res);
};
