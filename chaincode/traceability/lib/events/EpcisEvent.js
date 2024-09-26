'use strict';

const State = require('../utils/state.js');
const { x509Validator } = require('../utils/utils.js');

const epcisPrefix = 'epcis.event';
const EventType = {
    OBJECT: 'ObjectEvent',
    AGGREGATION: 'AggregationEvent',
    TRANSACTION: 'TransactionEvent',
    TRANSFORMATION: 'TransformationEvent'
};
const ActionType = {
    ADD: 'ADD',
    DELETE: 'DELETE',
    OBSERVE: 'OBSERVE'
};
class EpcisEvent extends State {
    constructor(obj) {
        super(EpcisEvent.getClass(), [obj.eventID]);
        Object.assign(this, obj);
    }

    getType() {
        return this.type;
    }

    getAction() {
        return this.action;
    }

    getBizStep() {
        return this.bizStep;
    }

    setCreatorMSP(mspid) {
        this.creatorMSP = mspid;
    }

    setCreatorIdentity(id) {
        if (!x509Validator.test(id)) {
            throw new Error('Invalid id format');
        }
        this.creatorId = id;
    }

    async getEvent(ctx, id) {
        const key = ctx.stub.createCompositeKey(epcisPrefix, [id]);
        return await ctx.stub.getState(key);
    }

    static fromBuffer(buffer) {
        return EpcisEvent.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to commercial paper
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, EpcisEvent);
    }

    /**
     * Factory method to create a commercial paper object
     */
    static createInstance(data) {
        return new EpcisEvent(data);
    }

    static getClass() {
        return 'org.epcis.EpcisEvent';
    }
}

module.exports.EpcisEvent = EpcisEvent;
module.exports.EventType = EventType;
module.exports.ActionType = ActionType;
