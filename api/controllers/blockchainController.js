const { BlockDecoder } = require('fabric-common');
const extensions = require('../config/extensions.js');
require('dotenv').config({ path: './config/.env' });

const checker = require('../utils/checkUtils.js');
const responseUtil = require('../utils/responseUtils.js');
const epcFormatsUtil = require('../utils/epcFormatUtil.js');
const queryUtilis = require('../utils/queryUtils.js');

exports.getTransaction = async (req, res) => {
  try {
    const result = await req.blockchain.qsccContract.evaluateTransaction(
      'GetTransactionByID',
      'mychannel',
      req.params.id
    );
    const resultObject = BlockDecoder.decodeTransaction(result);
    // return the result
    res.send(resultObject);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Failed to retrieve transaction' });
  }
};
