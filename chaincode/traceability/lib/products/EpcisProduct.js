'use strict';

const State = require('../utils/state.js');

const prefix = 'org.epcis.product';

class EpcisProduct extends State {
    constructor(obj) {
        super(EpcisProduct.getClass(), [obj.productId]);
        Object.assign(this, obj);
    }

    static async getProduct(ctx, id) {
        const key = ctx.stub.createCompositeKey(prefix, State.splitKey(id));
        return await ctx.stub.getState(key);
    }

    static fromBuffer(buffer) {
        return EpcisProduct.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to commercial paper
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, EpcisProduct);
    }

    /**
     * Factory method to create a commercial paper object
     */
    static createInstance(data) {
        return new EpcisProduct(data);
    }

    static getClass() {
        return 'org.epcis.EpcisProduct';
    }

}

module.exports = EpcisProduct;
