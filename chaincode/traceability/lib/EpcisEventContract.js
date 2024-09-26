'use strict';

const { Contract, Context } = require('fabric-contract-api');
const EpcisEventList = require('./events/EpcisEventList.js');
const { EpcisEvent } = require('./events/EpcisEvent.js');
const schema = require('./events/epcisEventSchema.json');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

class EpcisEventContext extends Context {
    constructor() {
        super();
        this.eventList = new EpcisEventList(this);
    }
}

const subscriberPrefix = 'subscribers';
const ajv = new Ajv();
addFormats(ajv);

class EpcisEventContract extends Contract {
    constructor() {
        super('org.epcis.EpcisEventContract');
    }

    createContext() {
        return new EpcisEventContext();
    }

    async instantiate(/*ctx*/) {
        console.log('EPCIS event contract instantiated');
    }

    async newEvent(ctx, data) {
        if (await ctx.eventList.getEvent(data.eventID)) {
            throw new Error('Event already registered');
        }

        if (!ajv.validate(schema, data)) {
            throw new Error('Data format not valid');
        }

        let event = EpcisEvent.createInstance(data);
        event.setCreatorMSP(ctx.clientIdentity.getMSPID());
        event.setCreatorIdentity(ctx.clientIdentity.getID());

        await ctx.eventList.addEvent(event);
        ctx.stub.setEvent(event.type, EpcisEvent.serialize(event));
        this.notify(ctx, event);

        return event;
    }

    async getEvent(ctx, id) {
        return await ctx.eventList.getEvent(id);
    }

    async subscribe(ctx, chaincode, channel) {
        const subKey = ctx.stub.createCompositeKey(subscriberPrefix, [chaincode, channel]);
        await ctx.stub.putState(subKey, Buffer.from(JSON.stringify({
            chaincode,
            channel,
            creatorMSP: ctx.clientIdentity.getMSPID(),
            creatorIdentity: ctx.clientIdentity.getID()
        })));

        return true;
    }

    async unsubscribe(ctx, chaincode, channel) {
        const subKey = ctx.stub.createCompositeKey(subscriberPrefix, [chaincode, channel]);
        const subData = await ctx.sub.getState(subKey);

        if (!subData) {
            throw new Error('Subscriber do not esxist');
        }

        if (subData.creatorMSP !== ctx.clientIdentity.getMSPID()) {
            throw new Error('Requesting organization does not own subscriber');
        }

        ctx.stub.deleteState(subKey);

        return true;
    }

    async notify(ctx, event) {
        let subscriberIterator = await ctx.stub.getStateByPartialCompositeKey(subscriberPrefix, []);

        let cursor = await subscriberIterator.next();
        while (!cursor.done) {
            const subscriber = JSON.parse(cursor.value.value.toString());
            await ctx.stub.invokeChaincode(subscriber.chaincode, ['onEvent', event], subscriber.channel);
            ctx.stub.setEvent('SubscriberNotified', subscriber.chaincode, subscriber.channel);

            cursor = await subscriberIterator.next();
        }

        return true;
    }
}

module.exports = EpcisEventContract;
