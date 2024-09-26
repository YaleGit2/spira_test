'use strict';

const SafeTokenERC721 = require('./safeTokenERC721.js');
const { ERC721_RECEIVER_MAGIC_NUMBER } = require('./iERC721TokenReceiver.js');
const { x509Validator } = require('../utils/utils.js');

// const MAGIC_NUMBER = 0xcd740db5;
const nftPrefix = 'nested_nft';
class TokenERC998ERC721TopDown extends SafeTokenERC721 {

    /**
     * rootOwnerOf his function traverses token owners until the the
     * root owner address of _tokenId is found.
     *
     * @param {Context} ctx the transaction context
     * @param {Integer} tokenId the non-fungible token to transfer
     * @returns {Integer} Return the id of the root owner
     */
    async rootOwnerOf(ctx, _tokenId) {
        const nftKey = ctx.stub.createCompositeKey(nftPrefix, [_tokenId]);
        const parentId = await ctx.stub.getState(nftKey);

        if (parentId && !x509Validator.test(parentId)) {
            return this.rootOwnerOf(ctx, parentId);
        }
        if (x509Validator.test(parentId)) {
            return parentId;
        }

        return this.OwnerOf(ctx, _tokenId);
    }

    async rootOwnerOfChild(ctx, _childContract, _childTokenId) {
    }

    async onERC721Received(ctx, _operator, _from, _tokenId, _data) {
        // Validate if _data is a valid existing id
        if (isNaN(_data)) {
            throw new Error('Recipient token format is not valid.');
        }

        const nftExists = await this._nftExists(ctx, _data);
        if (!nftExists) {
            throw new Error('Recipient token does not exist.');
        }

        const signedProposal = ctx.stub.getSignedProposal();
        const baseChannelId = signedProposal.proposal.header.channel_header.channel_id;

        const nftKey = ctx.stub.createCompositeKey(nftPrefix, [baseChannelId, _tokenId]);
        await ctx.stub.putState(nftKey, _data);

        const receiveChildEvent = {
            _from,
            _to: _data,
            _childContract: baseChannelId,
            _childTokenId: _tokenId
        };
        ctx.stub.setEvent('ReceivedChild', Buffer.from(JSON.stringify(receiveChildEvent)));

        return ERC721_RECEIVER_MAGIC_NUMBER;
    }

    async transferChild(ctx, _fromTokenId, _to, _childContract, _childTokenId) {
    }

    /**
     * safeTransferChild Transfer child token from top-down composable to address.
     *
     * @param {Context} ctx the transaction context
     * @param {Integer} _fromTokenId The owning token to transfer from
     * @param {String} _to The address that receives the child token
     * @param {String} _childContract The ERC-721 contract of the child token
     * @param {Integer} _childTokenId The tokenId of the token that is being transferred.
     * @returns {Boolean} Return true if the transfer succeeds
     */
    async safeTransferChild(ctx, _fromTokenId, _to, _childContract, _childTokenId, _data) {
        const sender = ctx.clientIdentity.getID();
        const rootOwner = await this.rootOwnerOf(ctx, _childTokenId);
        const owner = await this.OwnerOf(ctx, _fromTokenId);

        if (sender !== rootOwner || sender !== owner) {
            throw new Error('Sender is not allowed to perform this operation.');
        }

        const response = await this.SafeTransferFrom(ctx, sender, _to, _childTokenId, _data);

        const transferChildEvent = {
            _fromTokenId,
            _to,
            _childContract,
            _childTokenId
        };
        ctx.stub.setEvent('TransferChild', Buffer.from(JSON.stringify(transferChildEvent)));

        return response;
    }

    async transferChildToParent(ctx, _fromTokenId, _toContract, _toTokenId, _childContract, _childTokenId, _data) {

    }

    async getChild(_from, _tokenId, _childContract, _childTokenId) {

    }

}

module.exports = TokenERC998ERC721TopDown;
