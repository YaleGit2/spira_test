/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Context } = require('fabric-contract-api');
const { ChaincodeStub, ClientIdentity } = require('fabric-shim');

const EpcisEventContract = require('../lib/EpcisEventContract');
const EpcisEventList = require('../lib/events/EpcisEventList.js');

const EpcisProductContract = require('../lib/EpcisProductContract');
const EpcisProductList = require('../lib/products/EpcisProductList.js');

const mockObjectEvent = require('./mock-events/mockObjectEvent.json');
const mockAggregationEvent = require('./mock-events/mockAggregationEvent.json');
const { MockIterator } = require('./utils.js');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const expect = chai.expect;

chai.should();
chai.use(chaiAsPromised);

describe('EPICS 2.0 Product', () => {
    let sandbox;
    let epcisEventContract;
    let epcisProductContract;
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
        epcisEventContract = new EpcisEventContract(channelId);
        epcisProductContract = new EpcisProductContract();

        ctx = sinon.createStubInstance(Context);
        mockStub = sinon.createStubInstance(ChaincodeStub);
        ctx.stub = mockStub;
        mockClientIdentity = sinon.createStubInstance(ClientIdentity);
        ctx.clientIdentity = mockClientIdentity;

        mockStub.getState.withArgs('name').resolves(tokenName);
        mockClientIdentity.getMSPID.returns(orgName);
        mockClientIdentity.getID.returns(alice);

        ctx.eventList = new EpcisEventList(epcisEventContract);
        ctx.eventList.ctx = ctx;

        ctx.productList = new EpcisProductList(epcisProductContract);
        ctx.productList.ctx = ctx;

        mockContracts = {
            epcisEventContract,
            epcisProductContract
        };

        mockStub.getStateByPartialCompositeKey.resolves(new MockIterator([]));

        mockStub.invokeChaincode.callsFake( async (contractName, ...params) => {
            const method = params[0][0];
            return await mockContracts[contractName][method](ctx, params[0][1], params[0][2], params[0][3], params[0][4]);
        });

        mockStub.createCompositeKey.withArgs('subscribers', ['epcisProductContract', 'channel'])
            .returns('subscribers_epcisProductContract_channel');
        mockStub.getStateByPartialCompositeKey.withArgs('subscribers')
            .resolves(new MockIterator([{
                key: 'subscribers_epcisProductContract_channel',
                value: Buffer.from(JSON.stringify({
                    chaincode: 'epcisProductContract',
                    channel: 'channel'
                }))
            }]));
    });

    afterEach('Sandbox restoration', () => {
        sandbox.restore();
    });

    describe('Reading from contract', () => {
        beforeEach('Set up test parameters', async () => {
            sinon.stub(ctx.productList, 'getProduct').withArgs(mockObjectEvent.epcList[0]).resolves({
                class: 'org.epcis.EpcisProduct',
                key: mockObjectEvent.epcList[0],
                currentState: null,
                productId: mockObjectEvent.epcList[0],
                eventList: [
                    {
                        eventID: mockObjectEvent.eventID,
                        eventTime: mockObjectEvent.eventTime
                    }
                ]
            });
        });

        it('should return the status of products', async () => {
            const productListStatus = await epcisProductContract.checkProductList(ctx, mockObjectEvent.epcList.join(','));

            expect(productListStatus).to.eql([
                {
                    id: mockObjectEvent.epcList[0],
                    found: true
                },
                {
                    id: mockObjectEvent.epcList[1],
                    found: false
                }
            ]);
        });
    });

    describe('Object events', () => {
        beforeEach('Set up test parameters', () => {
        });

        it('should create products based on new event', async () => {
            let addProductStub = sinon.stub(ctx.productList, 'addProduct');
            await epcisProductContract.onEvent(ctx, JSON.stringify(mockObjectEvent));

            sinon.assert.calledTwice(addProductStub);
        });

        it('should update products based on new event', async () => {
            let updateProductStub = sinon.stub(ctx.productList, 'updateProduct');

            sinon.stub(ctx.productList, 'getProduct').withArgs(mockObjectEvent.epcList[0]).resolves({
                class: 'org.epcis.EpcisProduct',
                key: mockObjectEvent.epcList[0],
                currentState: null,
                productId: mockObjectEvent.epcList[0],
                eventList: [
                    {
                        eventID: mockObjectEvent.eventID,
                        eventTime: mockObjectEvent.eventTime
                    }
                ]
            });
            await epcisProductContract.onEvent(ctx, JSON.stringify(mockObjectEvent));

            sinon.assert.calledOnce(updateProductStub);
        });

        it('should mint tokens for new products', async () => {
            let mintStub = sinon.stub(epcisProductContract, 'MintWithTokenURI');
            await epcisProductContract.onEvent(ctx, JSON.stringify(mockObjectEvent));

            const nft = {
                tokenId: mockObjectEvent.epcList[0],
                owner: alice
            };
            sinon.stub(epcisProductContract, '_readNFT').resolves(nft);
            const owner = await epcisProductContract.OwnerOf(ctx, mockObjectEvent.epcList[0]);

            expect(owner).to.equals(alice);
            sinon.assert.calledTwice(mintStub);
        });

        it('should validate the schema for invalid JSON event data', async () => {
            const invalidEvent = { ...mockObjectEvent};
            delete invalidEvent.action;

            await expect(epcisProductContract.onEvent(ctx, JSON.stringify(invalidEvent)))
                .to.be.rejectedWith(Error, 'Data format not valid');
        });
    });

    describe('Aggregation events', () => {
        let _nftExistsStub;
        let updateProductStub;
        let getProductStub;

        beforeEach('Set up test parameters', async () => {
            _nftExistsStub = sinon.stub(epcisProductContract, '_nftExists');
            _nftExistsStub.resolves(true);
            getProductStub = sinon.stub(ctx.productList, 'getProduct');
            getProductStub.resolves({
                eventList: []
            });
            updateProductStub = sinon.stub(ctx.productList, 'updateProduct');
            const nft = {
                tokenId: mockObjectEvent.epcList[0],
                owner: alice
            };
            sinon.stub(epcisProductContract, '_readNFT').resolves(nft);
        });

        it('should forbid aggregation of unexisting child EPCs', async () => {
            sinon.stub(epcisProductContract, 'OwnerOf').resolves('Org1MSP@epcisProductContract');
            _nftExistsStub.withArgs(ctx, mockAggregationEvent.childEPCs[1]).resolves(false);

            await expect(epcisProductContract.onEvent(ctx, JSON.stringify(mockAggregationEvent)))
                .to.be.rejectedWith(Error, 'Some of the childEPC elements does not exist. Add object event first');
        });

        it('should transfer childEPCs to parent', async () => {
            const parentObjectEvent = {
                ...mockObjectEvent,
                epcList: [mockAggregationEvent.parentID]
            };
            await epcisProductContract.onEvent(ctx, JSON.stringify(parentObjectEvent));
            const compositeKey = `nft_${mockAggregationEvent.parentID}`;
            mockStub.createCompositeKey.withArgs('nft', [mockAggregationEvent.parentID]).returns(compositeKey);
            mockStub.getState.withArgs(compositeKey).resolves(Buffer.from(JSON.stringify({
                tokenId: mockAggregationEvent.parentID,
                owner: alice
            })));

            const transferStub = sinon.stub(epcisProductContract, 'TransferFrom');
            sinon.stub(epcisProductContract, 'OwnerOf').resolves(alice);

            await epcisProductContract.onEvent(ctx, JSON.stringify(mockAggregationEvent));

            sinon.assert.calledTwice(transferStub);
        });

        it('should add events from parent to aggregated products', async () => {
            const parentObjectEvent = {
                ...mockObjectEvent,
                epcList: [mockAggregationEvent.parentID]
            };
            getProductStub.withArgs(mockAggregationEvent.parentID).resolves(undefined);
            _nftExistsStub.withArgs(ctx, mockAggregationEvent.parentID).resolves(false);

            await epcisProductContract.onEvent(ctx, JSON.stringify(parentObjectEvent));
            const compositeKey = `nft_${mockAggregationEvent.parentID}`;
            mockStub.createCompositeKey.withArgs('nft', [mockAggregationEvent.parentID]).returns(compositeKey);
            mockStub.getState.withArgs(compositeKey).resolves(Buffer.from(JSON.stringify({
                tokenId: mockAggregationEvent.parentID,
                owner: alice
            })));

            sinon.stub(epcisProductContract, 'SafeTransferFrom');
            sinon.stub(epcisProductContract, 'MintWithTokenURI');

            sinon.stub(epcisProductContract, 'OwnerOf').resolves(alice);

            await epcisProductContract.onEvent(ctx, JSON.stringify(mockAggregationEvent));
            const mockBalances = [
                {
                    key: `balance_${mockAggregationEvent.parentID}_${mockAggregationEvent.childEPCs[0]}`,
                    value: mockAggregationEvent.childEPCs[0]
                },
                {
                    key: `balance_${mockAggregationEvent.parentID}_${mockAggregationEvent.childEPCs[1]}`,
                    value: mockAggregationEvent.childEPCs[1]
                }
            ];
            mockStub.getStateByPartialCompositeKey.resolves(new MockIterator(mockBalances));

            const baseObject = {
                class: 'org.epcis.EpcisProduct',
                currentState: null,
                eventList: [
                    {
                        eventID: mockObjectEvent.eventID,
                        eventTime: mockObjectEvent.eventTime
                    }
                ]
            };
            getProductStub.withArgs(mockAggregationEvent.parentID).resolves({
                ...baseObject,
                key: mockAggregationEvent.parentID,
                productId: mockAggregationEvent.parentID,
                eventList: [
                    {
                        eventID: mockAggregationEvent.eventID,
                        eventTime: mockAggregationEvent.eventTime
                    }
                ]
            });
            getProductStub.withArgs(mockObjectEvent.epcList[0]).resolves({
                ...baseObject,
                key: mockObjectEvent.epcList[0],
                productId: mockObjectEvent.epcList[0],
            });
            getProductStub.withArgs(mockObjectEvent.epcList[1]).resolves({
                ...baseObject,
                key: mockObjectEvent.epcList[1],
                productId: mockObjectEvent.epcList[1],
            });

            await epcisProductContract.onEvent(ctx, JSON.stringify(parentObjectEvent));

            sinon.assert.callCount(updateProductStub, 5);
        });

        it('should validate the schema for invalid JSON event data', async () => {
            const invalidEvent = { ...mockAggregationEvent};
            delete invalidEvent.childEPCs;
            delete invalidEvent.childQuantityList;

            await expect(epcisProductContract.onEvent(ctx, JSON.stringify(invalidEvent)))
                .to.be.rejectedWith(Error, 'Data format not valid');
        });
    });

});
