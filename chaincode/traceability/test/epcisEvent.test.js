/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Context } = require('fabric-contract-api');
const { ChaincodeStub, ClientIdentity } = require('fabric-shim');

const EpcisEventContract = require('../lib/EpcisEventContract');
const EpcisEventList = require('../lib/events/EpcisEventList.js');
const { EpcisEvent } = require('../lib/events/EpcisEvent.js');

const mockObjectEvent = require('./mock-events/mockObjectEvent.json');
const { MockIterator } = require('./utils.js');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const expect = chai.expect;

chai.should();
chai.use(chaiAsPromised);

describe('EPICS 2.0 Event', () => {
    let sandbox;
    let epcisContract;
    let ctx;
    let mockStub;
    let mockClientIdentity;
    const tokenName = 'EPCIS Product';
    const orgName = 'Org1MSP';
    const alice = 'x509::/C=US/ST=North Carolina/O=Hyperledger/OU=client/CN=alice::/C=US/ST=North Carolina/L=Durham/O=org1.example.com/CN=ca.org1.example.com';
    const channelId = 'Org1MSP@epcis-product';
    let mockContracts;

    beforeEach('Sandbox creation', async () => {
        sandbox = sinon.createSandbox();

        epcisContract = new EpcisEventContract(channelId);

        ctx = sinon.createStubInstance(Context);
        mockStub = sinon.createStubInstance(ChaincodeStub);
        ctx.stub = mockStub;
        mockClientIdentity = sinon.createStubInstance(ClientIdentity);
        ctx.clientIdentity = mockClientIdentity;

        mockStub.getState.withArgs('name').resolves(tokenName);
        mockClientIdentity.getMSPID.returns(orgName);
        mockClientIdentity.getID.returns(alice);

        mockContracts = {
            epcisContract
        };
        mockStub.invokeChaincode.callsFake( async (contractName, ...params) => {
            const method = params[0][0];
            return await mockContracts[contractName][method](ctx, params[0][1], params[0][2], params[0][3], params[0][4]);
        });
        ctx.eventList = new EpcisEventList(epcisContract);
        ctx.eventList.ctx = ctx;
    });

    afterEach('Sandbox restoration', () => {
        sandbox.restore();
    });

    describe('While managing events', () => {
        let mockObjectEventExpectedResponse;
        let mockObjectEventKey;
        const generateMockObject = (baseObject) => {
            const mock = EpcisEvent.createInstance(baseObject);
            // delete mock.key; // TODO: when issue solved, it needs to be uncommented or removed
            mock.creatorMSP = orgName;
            mock.creatorId = alice;

            return mock;
        };
        const getMockEventKey = (event) => `org.epcis.event_${event.eventID}`;
        const generateMockEventKey = () => {
            const sha256 = parseInt((Math.random()*1000000)).toString(16);
            return `ni:///sha-256;${sha256}?ver=CBV2.0`;
        };
        beforeEach('Set up test parameters', () => {
            mockObjectEventKey = getMockEventKey(mockObjectEvent);
            mockStub.createCompositeKey.withArgs('org.epcis.event', mockObjectEvent.eventID.split(':')).returns(mockObjectEventKey);
            mockObjectEventExpectedResponse = generateMockObject(mockObjectEvent);
            mockStub.getStateByPartialCompositeKey.resolves(new MockIterator([]));
        });

        it('should create new event', async () => {
            const response = await epcisContract.newEvent(ctx, mockObjectEvent);
            sinon.assert.calledWith(mockStub.putState, mockObjectEventKey, Buffer.from(JSON.stringify(mockObjectEventExpectedResponse)));
            expect(response).to.deep.equal(mockObjectEventExpectedResponse);
        });

        it('should throw an error if an existing event ID is added', async () => {
            await epcisContract.newEvent(ctx, mockObjectEvent);
            mockStub.getState.withArgs(mockObjectEventKey)
                .resolves(Buffer.from(JSON.stringify(mockObjectEventExpectedResponse)));

            await expect(epcisContract.newEvent(ctx, mockObjectEvent))
                .to.be.rejectedWith(Error, 'Event already registered');
        });

        it('should query for events', async () => {
            // Generate 10 new events based on a base JSON
            const eventList = Array.apply(null, Array(10)).map( () => {
                const eventTime = new Date(mockObjectEvent.eventTime);
                eventTime.setDate(eventTime.getDate()+Math.random()*15);
                return {
                    ...mockObjectEvent,
                    eventTime: eventTime.toISOString(), // within 15 days
                    eventID: generateMockEventKey()
                };
            });
            const response = await Promise.all(eventList.map( async (obj) => {
                await epcisContract.newEvent(ctx, obj);
                const mockObj = generateMockObject(obj);
                mockStub.getState.withArgs(obj.eventID)
                    .resolves(Buffer.from(JSON.stringify(mockObj)));
                return mockObj;
            }));
            expect(response.length).to.equals(10);
        });

        it('should notify subscribers on new events', async () => {
            let spy;
            mockContracts.subscriber = {
                onEvent: (event) => {
                    expect(spy.calledOnce).to.be.true;
                }
            };
            spy = sinon.spy(mockContracts.subscriber, 'onEvent');
            mockStub.createCompositeKey.withArgs('subscribers', ['subscriber', 'channel'])
                .returns('subscribers_subscriber_channel');

            await epcisContract.subscribe(ctx, 'subscriber', 'channel');
            mockStub.getStateByPartialCompositeKey.withArgs('subscribers')
                .resolves(new MockIterator([{
                    key: 'subscribers_subscriber_channel',
                    value: Buffer.from(JSON.stringify({
                        chaincode: 'subscriber',
                        channel: 'channel'
                    }))
                }]));
            await epcisContract.newEvent(ctx, mockObjectEvent);
        });

        it('should validate the schema for invalid JSON event data', async () => {
            const invalidEvent = { ...mockObjectEvent};
            delete invalidEvent.action;

            await expect(epcisContract.newEvent(ctx, invalidEvent))
                .to.be.rejectedWith(Error, 'Data format not valid');
        });
    });

});
