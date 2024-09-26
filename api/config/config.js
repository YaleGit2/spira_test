const env = require('dotenv');

exports.commitTimeout = '300';

/**
 * The transaction submit timeout in seconds for the endorsement to complete
 */
exports.endorseTimeout = '30';

/**
 * The transaction query timeout in seconds
 */
exports.queryTimeout = '3';
