'use strict';

const StateList = require('../utils/statelist.js');
const EpcisProduct = require('./EpcisProduct.js');

class EpcisProductList extends StateList {
    constructor(ctx) {
        super(ctx, 'org.epcis.product');
        this.use(EpcisProduct);
    }

    async addProduct(product) {
        return await this.addState(product);
    }

    async getProduct(productKey) {
        return await this.getState(productKey);
    }

    async updateProduct(product) {
        return await this.updateState(product);
    }
}

module.exports = EpcisProductList;
