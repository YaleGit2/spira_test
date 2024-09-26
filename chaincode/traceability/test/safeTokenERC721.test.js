/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Context } = require('fabric-contract-api');
const { ChaincodeStub, ClientIdentity } = require('fabric-shim');

const SafeTokenERC721 = require('../lib/tokens/safeTokenERC721.js');
const { ERC721Receiver } = require('../lib/tokens/iERC721TokenReceiver.js');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const expect = chai.expect;

chai.should();
chai.use(chaiAsPromised);
class MockERC721Receiver extends ERC721Receiver {

}

describe('Safe Token ERC-721', () => {
    let sandbox;
    let token;
    let ctx;
    let mockStub;
    let mockClientIdentity;
    const tokenName = 'My Token';
    const orgName = 'Org1MSP';
    const alice = 'x509::/C=US/ST=North Carolina/O=Hyperledger/OU=client/CN=alice::/C=US/ST=North Carolina/L=Durham/O=org1.example.com/CN=ca.org1.example.com';
    const bob = 'x509::/C=US/ST=North Carolina/O=Hyperledger/OU=client/CN=bob::/C=US/ST=North Carolina/L=Durham/O=org1.example.com/CN=ca.org1.example.com';
    const charlie = 'x509::/C=US/ST=North Carolina/O=Hyperledger/OU=client/CN=charlie::/C=US/ST=North Carolina/L=Durham/O=org1.example.com/CN=ca.org2.example.com';
    const tokenId = 101;
    let _readNFTStub;

    beforeEach('Sandbox creation', async () => {
        sandbox = sinon.createSandbox();
        token = new SafeTokenERC721('token-erc721');

        ctx = sinon.createStubInstance(Context);
        mockStub = sinon.createStubInstance(ChaincodeStub);
        ctx.stub = mockStub;
        mockClientIdentity = sinon.createStubInstance(ClientIdentity);
        ctx.clientIdentity = mockClientIdentity;

        mockStub.getState.withArgs('name').resolves(tokenName);
        mockClientIdentity.getMSPID.returns(orgName);
        mockClientIdentity.getID.returns(alice);


    });

    afterEach('Sandbox restoration', () => {
        sandbox.restore();
    });

    describe('While transfering tokens', () => {
        let currentNft;
        let updatedNft;

        beforeEach('Set up test parameters', () => {
            currentNft = {
                tokenId,
                owner: alice,
                org: orgName,
                approved: charlie
            };

            updatedNft = {
                tokenId,
                owner: bob,
                org: orgName,
                approved: ''
            };

            _readNFTStub = sinon.stub(token, '_readNFT');
            _readNFTStub.withArgs(ctx, tokenId).resolves(currentNft);
            mockStub.createCompositeKey.withArgs('nft', [tokenId]).returns(`nft_${tokenId}`);
            mockStub.createCompositeKey.withArgs('balance', [alice, tokenId]).returns(`balance_${alice}_${tokenId}`);
            mockStub.createCompositeKey.withArgs('balance', [bob, tokenId]).returns(`balance_${bob}_${tokenId}`);
        });

        it('should refuse invalid sender ID format', async () => {
            mockClientIdentity.getID.returns('Dave');

            await expect(
                token.SafeTransferFrom(ctx, alice, bob, tokenId, 'From alice to Bob')
            ).to.be.rejectedWith(Error, 'Sender ID is not valid');
        });

        it('should refuse invalid from ID format', async () => {
            mockClientIdentity.getID.returns('Alice');

            await expect(
                token.SafeTransferFrom(ctx, 'Alice', bob, tokenId, 'From alice to Bob')
            ).to.be.rejectedWith(Error, 'Sender ID is not valid');
        });

        it('should refuse invalid receiver', async () => {
            mockClientIdentity.getID.returns(alice);

            await expect(
                token.SafeTransferFrom(ctx, alice, 'Bob', tokenId, 'From alice to Bob')
            ).to.be.rejectedWith(Error, 'Receiver is not a valid ID nor ERC721Receiver');
        });

        it('should work when a sender is the current owner', async () => {
            mockClientIdentity.getID.returns(alice);
            sinon.stub(token, 'IsApprovedForAll').resolves(false);

            const response = await token.SafeTransferFrom(ctx, alice, bob, tokenId, 'From alice to Bob');
            sinon.assert.calledWith(mockStub.putState, `nft_${tokenId}`, Buffer.from(JSON.stringify(updatedNft)));
            expect(response).to.equals(true);

        });

        it('should work when the receiver is a smart contract compatible with ERC721Receiver', async () => {
            mockClientIdentity.getID.returns(alice);
            sinon.stub(token, 'IsApprovedForAll').resolves(false);
            const receiver = new MockERC721Receiver();
            const mockChaincodeList = {
                'Org1MSP@token_contract': receiver
            };
            mockStub.invokeChaincode.callsFake( (contractName, ...params) => {
                const object = mockChaincodeList[contractName];
                if (object) {
                    return object.onERC721Received(ctx, ...params);
                } else {
                    return false;
                }
            });

            const response = await token.SafeTransferFrom(ctx, alice, 'Org1MSP@token_contract', tokenId, 102);
            sinon.assert.calledWith(mockStub.putState, `nft_${tokenId}`, Buffer.from(JSON.stringify({
                tokenId,
                owner: 'Org1MSP@token_contract',
                org: orgName,
                approved: ''
            })));
            expect(response).to.equals(true);
        });

        it('should work when the receiver is a valid token id', async () => {
            mockClientIdentity.getID.returns(alice);
            sinon.stub(token, 'IsApprovedForAll').resolves(false);
            sinon.stub(token, '_nftExists').withArgs(ctx, 'abc123').resolves({
                tokenId: 'abc123',
                owner: bob,
                approved: null
            });

            const response = await token.SafeTransferFrom(ctx, alice, 'abc123', tokenId, '');
            sinon.assert.calledWith(mockStub.putState, `nft_${tokenId}`, Buffer.from(JSON.stringify({
                tokenId,
                owner: 'abc123',
                org: orgName,
                approved: ''
            })));
            expect(response).to.equals(true);
        });

        it('should work when a sender is the approved client for this token', async () => {
            mockClientIdentity.getID.returns(charlie);
            sinon.stub(token, 'IsApprovedForAll').resolves(false);

            const response = await token.SafeTransferFrom(ctx, alice, bob, tokenId);
            sinon.assert.calledWith(mockStub.putState, `nft_${tokenId}`, Buffer.from(JSON.stringify(updatedNft)));
            expect(response).to.equals(true);
        });

        it('should work when a sender is an authorized operator', async () => {
            mockClientIdentity.getID.returns('x509::Dave::Org1MSP');
            sinon.stub(token, 'IsApprovedForAll').resolves(true);

            const response = await token.SafeTransferFrom(ctx, alice, bob, tokenId);
            sinon.assert.calledWith(mockStub.putState, `nft_${tokenId}`, Buffer.from(JSON.stringify(updatedNft)));
            expect(response).to.equals(true);
        });

        it('should work when the sender is from the same organization', async () => {
            mockClientIdentity.getID.returns(alice);
            sinon.stub(token, 'IsApprovedForAll').resolves(false);
            const receiver = new MockERC721Receiver();
            const mockChaincodeList = {
                'Org1MSP@token_contract': receiver
            };
            mockStub.invokeChaincode.callsFake( (contractName, ...params) => {
                const object = mockChaincodeList[contractName];
                if (object) {
                    return object.onERC721Received(ctx, ...params);
                } else {
                    return false;
                }
            });

            await token.SafeTransferFrom(ctx, alice, 'Org1MSP@token_contract', tokenId, 102);
            sinon.assert.calledWith(mockStub.putState, `nft_${tokenId}`, Buffer.from(JSON.stringify({
                tokenId,
                owner: 'Org1MSP@token_contract',
                org: orgName,
                approved: ''
            })));

            mockClientIdentity.getID.returns('x509::Eve::Org1MSP');
            const response = await token.SafeTransferFrom(ctx, 'Org1MSP@token_contract', bob, tokenId);
            expect(response).to.equals(true);
        });

        it('should throw an error when a sender is invalid', async () => {
            mockClientIdentity.getID.returns('x509::Eve::Org2MSP');
            mockClientIdentity.getMSPID.returns('Org2MSP');
            sinon.stub(token, 'IsApprovedForAll').resolves(false);

            await expect(token.SafeTransferFrom(ctx, alice, bob, tokenId))
                .to.be.rejectedWith(Error, 'The sender is not allowed to transfer the non-fungible token');
        });

        it('should throw an error when a current owner does not match', async () => {
            mockClientIdentity.getID.returns('Dave');
            sinon.stub(token, 'IsApprovedForAll').resolves(true);

            await expect(token.TransferFrom(ctx, 'Charlie', 'Bob', tokenId))
                .to.be.rejectedWith(Error, 'The from is not the current owner.');
        });

        it('should throw an error when senders organization and token owner do not match', async () => {
            mockClientIdentity.getID.returns(alice);
            sinon.stub(token, 'IsApprovedForAll').resolves(false);
            const receiver = new MockERC721Receiver();
            const mockChaincodeList = {
                'Org1MSP@token_contract': receiver
            };
            mockStub.invokeChaincode.callsFake( (contractName, ...params) => {
                const object = mockChaincodeList[contractName];
                if (object) {
                    return object.onERC721Received(ctx, ...params);
                } else {
                    return false;
                }
            });

            const response = await token.SafeTransferFrom(ctx, alice, 'Org1MSP@token_contract', tokenId, 102);
            sinon.assert.calledWith(mockStub.putState, `nft_${tokenId}`, Buffer.from(JSON.stringify({
                tokenId,
                owner: 'Org1MSP@token_contract',
                org: orgName,
                approved: ''
            })));
            expect(response).to.equals(true);

            mockClientIdentity.getID.returns('x509::Eve::Org2MSP');
            mockClientIdentity.getMSPID.returns('Org2MSP');
            await expect(token.SafeTransferFrom(ctx, 'Org1MSP@token_contract', bob, tokenId))
                .to.be.rejectedWith(Error, 'The sender is not allowed to transfer the non-fungible token');
        });

    });

});
