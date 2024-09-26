/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const safeTokenERC721Contract = require('./lib/tokens/safeTokenERC721.js');
const tokenERC721Contract = require('./lib/tokens/tokenERC721.js');
const EpcisProductContract = require('./lib/EpcisProductContract.js');

module.exports.EpcisProductContract = EpcisProductContract;
module.exports.safeTokenERC721Contract = safeTokenERC721Contract;
module.exports.tokenERC721Contract = tokenERC721Contract;
module.exports.contracts = [EpcisProductContract, tokenERC721Contract, safeTokenERC721Contract];
