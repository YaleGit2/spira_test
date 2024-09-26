/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Context } = require('fabric-contract-api');
const { ChaincodeStub, ClientIdentity } = require('fabric-shim');

const SafeTokenERC721 = require('../lib/tokens/safeTokenERC721.js');
const TokenERC998ERC721TopDown = require('../lib/tokens/tokenERC998.js');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const expect = chai.expect;

chai.should();
chai.use(chaiAsPromised);

describe('Token ERC-998 Top-Down', () => {
    let sandbox;
    let token721;
    let token998;
    let ctx;
    let mockStub;
    let mockClientIdentity;
    const tokenName = 'My Token';
    const orgName = 'Org1MSP';
    const alice = 'x509::Alice::Org1MSP';
    const bob = 'x509::Bob::Org1MSP';
    const charlie = 'x509::Charlie::Org1MSP';
    const tokenId = 101;

    beforeEach('Sandbox creation', async () => {
        sandbox = sinon.createSandbox();

        token721 = new SafeTokenERC721('token-erc721');
        token998 = new TokenERC998ERC721TopDown('token-erc998');

        ctx = sinon.createStubInstance(Context);
        mockStub = sinon.createStubInstance(ChaincodeStub);
        ctx.stub = mockStub;
        mockClientIdentity = sinon.createStubInstance(ClientIdentity);
        ctx.clientIdentity = mockClientIdentity;

        mockStub.getState.withArgs('name').resolves(tokenName);
        mockClientIdentity.getMSPID.returns(orgName);
        mockClientIdentity.getID.returns(alice);

        const mockChaincodeList = {
            erc721: token721,
            erc998: token998
        };
        mockStub.invokeChaincode.callsFake( async (contractName, ...params) => {
            const object = mockChaincodeList[contractName];

            if (object) {
                const method = params[0][0];
                return await object[method](ctx, params[0][1], params[0][2], params[0][3], params[0][4]);
            } else {
                return false;
            }
        });
    });

    afterEach('Sandbox restoration', () => {
        sandbox.restore();
    });

    describe('While transfering tokens', () => {
        let currentNft;
        // let updatedNft;

        beforeEach('Set up test parameters', () => {
            currentNft = {
                tokenId,
                owner: alice,
                approved: charlie
            };

            sinon.stub(token721, '_readNFT').withArgs(ctx, tokenId).resolves(currentNft);
            mockStub.createCompositeKey.withArgs('nft', [tokenId]).returns(`nft_${tokenId}`);
            mockStub.createCompositeKey.withArgs('nested_nft', [tokenId]).returns(`nested_nft_${tokenId}`);
            mockStub.getSignedProposal.returns({
                proposal: {
                    header: {
                        channel_header: {
                            channel_id: 'erc721'
                        }
                    }
                }
            });
        });

        it('should refuse invalid token ID format', async () => {
            mockClientIdentity.getID.returns(alice);

            await expect(
                token721.SafeTransferFrom(ctx, alice, 'Org1MSP@erc998', 101, 'one zero two')
            ).to.be.rejectedWith(Error, 'Recipient token format is not valid');
        });

        it('should refuse inexistant token ID', async () => {
            mockClientIdentity.getID.returns(alice);
            sinon.stub(token998, '_nftExists').resolves(false);

            await expect(
                token721.SafeTransferFrom(ctx, alice, 'Org1MSP@erc998', 101, 1002)
            ).to.be.rejectedWith(Error, 'Recipient token does not exist');
        });

        it('should allow transfering a token to another', async () => {
            mockClientIdentity.getID.returns(alice);
            sinon.stub(token721, 'IsApprovedForAll').resolves(false);
            sinon.stub(token998, '_nftExists').withArgs(ctx, 1002).resolves(true);

            const response = await token721.SafeTransferFrom(ctx, alice, 'Org1MSP@erc998', 101, 1002);
            expect(response).to.equals(true);

            mockStub.getState.withArgs('nft_101').resolves('Org1MSP@erc998');
            const owner = await token721.OwnerOf(ctx, 101);
            expect(owner).to.equals('Org1MSP@erc998');

            mockStub.getState.withArgs('nested_nft_101').resolves(1002);
            const nft = {
                tokenId: 1002,
                owner: bob
            };
            sinon.stub(token998, '_readNFT').withArgs(ctx, 1002).resolves(nft);

            const rootOwner = await token998.rootOwnerOf(ctx, 101);
            expect(rootOwner).to.equals(bob);
        });

        it('should allow multiple nested tokens', async () => {
            mockClientIdentity.getID.returns(alice);
            sinon.stub(token721, 'IsApprovedForAll').resolves(false);
            sinon.stub(token998, '_nftExists').resolves(true);
            const _readNFTStub = sinon.stub(token998, '_readNFT');

            await token721.SafeTransferFrom(ctx, alice, 'Org1MSP@erc998', 101, 1002);
            mockStub.getState.withArgs('nested_nft_101').resolves(1002);

            const nft1002 = {
                tokenId: 1002,
                owner: bob
            };
            const nft1003 = {
                tokenId: 1003,
                owner: charlie
            };
            _readNFTStub.withArgs(ctx, 1002).resolves(nft1002);
            _readNFTStub.withArgs(ctx, 1003).resolves(nft1003);

            mockClientIdentity.getID.returns(bob);
            mockStub.createCompositeKey.withArgs('nested_nft', [1002]).returns('nested_nft_1002');
            await token998.SafeTransferFrom(ctx, bob, 'Org1MSP@erc998', 1002, 1003);
            mockStub.getState.withArgs('nested_nft_1002').resolves(1003);

            const rootOwner = await token998.rootOwnerOf(ctx, 101);
            expect(rootOwner).to.equals(charlie);
        });

        it('should forbid unauthorized senders to transfer child tokens', async () => {
            mockClientIdentity.getID.returns(alice);
            sinon.stub(token721, 'IsApprovedForAll').resolves(false);
            sinon.stub(token998, '_nftExists').withArgs(ctx, 1002).resolves(true);

            const response = await token721.SafeTransferFrom(ctx, alice, 'Org1MSP@erc998', 101, 1002);
            expect(response).to.equals(true);

            mockStub.getState.withArgs('nft_101').resolves('Org1MSP@erc998');
            const owner = await token721.OwnerOf(ctx, 101);
            expect(owner).to.equals('Org1MSP@erc998');

            mockStub.getState.withArgs('nested_nft_101').resolves(1002);
            const nft = {
                tokenId: 1002,
                owner: bob
            };
            sinon.stub(token998, '_readNFT').withArgs(ctx, 1002).resolves(nft);

            await expect(
                token998.safeTransferChild(ctx, 1002, alice, 'Org1MSP@erc721', 101, 'From alice to alice')
            ).to.be.rejectedWith(Error, 'Sender is not allowed to perform this operation.');
        });

        it('should allow owners to transfer child tokens', async () => {
            mockClientIdentity.getID.returns(alice);
            sinon.stub(token721, 'IsApprovedForAll').resolves(false);
            sinon.stub(token998, '_nftExists').withArgs(ctx, 1002).resolves(true);

            let response = await token721.SafeTransferFrom(ctx, alice, 'Org1MSP@erc998', 101, 1002);
            expect(response).to.equals(true);

            const _readNFT = sinon.stub(token998, '_readNFT');
            _readNFT.withArgs(ctx, 1002).resolves({
                tokenId: 1002,
                owner: bob
            });
            _readNFT.withArgs(ctx, 101).resolves({
                tokenId: 101,
                owner: 'Org1MSP@erc998',
                org: orgName
            });
            mockStub.getState.withArgs('nested_nft_101').resolves(1002);
            mockStub.getState.withArgs('nested_nft_1002').resolves(bob);

            mockClientIdentity.getID.returns(bob);
            response = await token998.safeTransferChild(ctx, 1002, charlie, 'Org1MSP@erc721', 101, 'From bob to charlie');
            expect(response).to.equals(true);
        });

    });

});
