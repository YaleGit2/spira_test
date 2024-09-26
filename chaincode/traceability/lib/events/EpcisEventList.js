'use strict';

const StateList = require('../utils/statelist.js');

const { EpcisEvent } = require('./EpcisEvent.js');

class EpcisEventList extends StateList {
    constructor(ctx) {
        super(ctx, 'org.epcis.event');
        this.use(EpcisEvent);
    }

    async addEvent(event) {
        return this.addState(event);
    }

    async getEvent(eventKey) {
        return this.getState(eventKey);
    }

    async updateEvent(event) {
        return this.updateState(event);
    }
}

module.exports = EpcisEventList;