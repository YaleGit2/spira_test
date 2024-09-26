const extensions = require('../config/extensions.js');
require('dotenv').config({ path: './config/.env' });

const checker = require('../utils/checkUtils.js');
const responseUtil = require('../utils/responseUtils.js');
const epcFormatsUtil = require('../utils/epcFormatUtil.js');
const queryUtilis = require('../utils/queryUtils.js');

exports.epcs = async (req, res) => {
  try {
    const contract = req.blockchain.epcisContract;
    res.set({
      'GS1-EPCIS-Version': '2.0',
      'GS1-CBV-Version': '2.0',
      'GS1-Extensions': [''],
    });

    //console.log(req.headers)
    const [queryCheck, queryCheckError] = checker.checkQueryParameter(
      req.headers
    );
    if (!queryCheck) {
      return responseUtil.response406(res, queryCheckError);
    }

    var responseLimit = 50;
    var queryString = {};
    if (req.query.PerPage) {
      responseLimit = req.query.PerPage;
    }

    let bookmark = '';
    if (typeof req.query.nextPageToken !== 'undefined') {
      const token = req.query.nextPageToken.replace('rel="next"', '');
      bookmark = token;
    }
    queryString.docType = 'epc';
    let mangoQueryString = {};
    mangoQueryString.selector = queryString;
    mangoQueryString = JSON.stringify(mangoQueryString);
    console.log('mangoQueryString : ', mangoQueryString);

    let resultTransction = await contract.evaluateTransaction(
      'QueryEPCISWithPagination',
      mangoQueryString,
      responseLimit.toString(),
      bookmark
    );

    let resultFabric = JSON.parse(resultTransction);
    if (typeof resultFabric.results !== undefined) {
      var responseContext = [];
      var responseType = 'Collection';
      var responseMember = [];
      if (resultFabric.results.length > 0) {
        console.log(resultFabric.results.length, ' epc returned');
        responseContext.push(
          'https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld'
        );

        const epcFormats = [
          'No_Preference',
          'Always_GS1_Digital_Link',
          'Always_EPC_URN',
          'Never_Translates',
        ];
        let epcFormat = 'Always_GS1_Digital_Link';
        if (req.headers.hasOwnProperty('gs1-epc-format')) {
          if (epcFormats.includes(req.headers['gs1-epc-format'])) {
            epcFormat = req.headers['gs1-epc-format'];
          }
        }
        console.log('epcFormat : ', epcFormat);
        if (epcFormat == 'No_Preference') {
          resultFabric.results.forEach((resul) => {
            const element = resul.Record;
            if (element.voc) {
              responseMember.push(element.voc);
            }
          });
        }
        if (epcFormat == 'Never_Translates') {
          resultFabric.results.forEach((resul) => {
            const element = resul.Record;
            if (element.voc) {
              responseMember.push(element.voc);
            }
          });
        }
        if (epcFormat == 'Always_GS1_Digital_Link') {
          resultFabric.results.forEach((resul) => {
            const element = resul.Record;
            if (element.voc) {
              responseMember.push(
                epcFormatsUtil.getDigitalLinkFormat(element.voc)
              );
            }
          });
        }
        if (epcFormat == 'Always_EPC_URN') {
          resultFabric.results.forEach((resul) => {
            const element = resul.Record;
            if (element.voc) {
              responseMember.push(epcFormatsUtil.getURNFormat(element.voc));
            }
          });
        }

        const next = resultFabric.bookmark;
        var Link =
          process.env.ROOT_END_POINT +
          '/epcs?perPage=' +
          responseLimit +
          '&nextPageToken=' +
          next;
        if (resultFabric.results.length >= responseLimit) {
          Link = Link + 'rel="next"';
        }
        res.set({ Link: Link });
        res.set({ 'GS1-Next-Page-Token-Expires': 'NA' });
      }
      return res.status(200).json({
        '@context': responseContext,
        type: responseType,
        member: responseMember,
      });
    }
  } catch (error) {
    console.log(String(error));
    responseUtil.response500(res, error);
  }
};

exports.epcsResource = async (req, res) => {
  try {
    const contract = req.blockchain.epcisContract;
    res.set({
      'GS1-EPCIS-Version': '2.0',
      'GS1-CBV-Version': '2.0',
      'GS1-Extensions': [''],
    });

    const epcPar = req.params.epc;
    const [queryCheck, queryCheckError] = checker.checkQueryParameter(
      req.headers
    );
    if (!queryCheck) {
      return responseUtil.response406(res, queryCheckError);
    }

    var queryString = {};
    queryString.docType = 'epc';
    queryString.voc = epcPar;
    let mangoQueryString = {};
    mangoQueryString.selector = queryString;

    mangoQueryString = JSON.stringify(mangoQueryString);

    let resultTransction = await contract.evaluateTransaction(
      'VocExists',
      mangoQueryString
    );

    let resultFabric = JSON.parse(resultTransction);
    if (typeof resultFabric !== 'undefined') {
      if (resultFabric.length > 0) {
        return res.status(200).json({
          '@context':
            'https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld',
          type: 'Collection',
          member: ['events'],
        });
      } else {
        responseUtil.response404(res);
      }
    } else {
      responseUtil.response404(res);
    }
  } catch (error) {
    console.log(String(error));
    responseUtil.response500(res, error);
  }
};

exports.epcsEvent = (req, res) => {
  req.query['oliot:epc'] = req.params.epc;
  queryUtilis.getQueryResult(req, res);
};
