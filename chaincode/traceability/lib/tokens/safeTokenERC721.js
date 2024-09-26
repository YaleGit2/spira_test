'use strict';

const TokenERC721Contract = require('./tokenERC721.js');
// This is an implementation of the ERC-721 token with a check
//  for transfer destination to avoid unexpected transference to addresses unable to manage the tokens

const { x509Validator, orgAtChaincodeValidator, orgAtChaincodeGetter } = require('../utils/utils.js');

const balancePrefix = 'balance';
const nftPrefix = 'nft';
class SafeTokenERC721 extends TokenERC721Contract {
    /**
     * SafeTransferFrom transfers the ownership of a non-fungible token
     * from one owner to another owner and check if receiver is able to manage the tokens
     *
     * @param {Context} ctx the transaction context
     * @param {String} from The current owner of the non-fungible token
     * @param {String} to The new owner
     * @param {String} tokenId the non-fungible token to transfer
     * @param {String} data additional data to the transaction
     * @returns {Boolean} Return whether the transfer was successful or not
     */
    async SafeTransferFrom(ctx, from, to, tokenId, data) {
        await this.CheckInitialized(ctx);
        // Check if receiver is valid account or implements ERC721Receiver
        const sender = ctx.clientIdentity.getID();

        if (!x509Validator.test(sender) && !orgAtChaincodeValidator.test(sender) && !orgAtChaincodeValidator.test(sender)) {
            throw new Error('Sender ID is not valid');
        }

        if (!x509Validator.test(from) && !orgAtChaincodeValidator.test(from) && !orgAtChaincodeValidator.test(from)) {
            throw new Error('Origin ID is not valid');
        }

        let isValidReceiver = false;
        const toIsToken = await this._nftExists(ctx, to);

        isValidReceiver = isValidReceiver || x509Validator.test(to) || orgAtChaincodeValidator.test(to) || toIsToken;

        if (!isValidReceiver) {
            console.error('Receiver is not a valid ID nor ERC721Receiver', to);
            throw new Error('Receiver is not a valid ID nor ERC721Receiver');
        }

        if (orgAtChaincodeValidator.test(to)){
            const receiverAttr = orgAtChaincodeGetter(to);
            const targetChainCodeResult = await ctx.stub.invokeChaincode(receiverAttr.chaincode, ['onERC721Received', sender, from, tokenId, data]);
            isValidReceiver = targetChainCodeResult ? true : false;
        }

        const nft = await this._readNFT(ctx, tokenId);

        // Check if the sender is the current owner, an authorized operator,
        // or the approved client for this non-fungible token.
        const owner = nft.owner;
        const tokenApproval = nft.approved;
        const operatorApproval = await this.IsApprovedForAll(ctx, owner, sender);

        const senderPermission = owner === sender || nft.org === ctx.clientIdentity.getMSPID();
        if ( !senderPermission && tokenApproval !== sender && !operatorApproval) {
            throw new Error('The sender is not allowed to transfer the non-fungible token');
        }

        // Check if `from` is the current owner
        const fromPermission = owner === from || nft.org === ctx.clientIdentity.getMSPID();

        if (!fromPermission) {
            throw new Error('The from is not the current owner.');
        }

        // Clear the approved client for this non-fungible token
        nft.approved = '';

        // Overwrite a non-fungible token to assign a new owner.
        nft.owner = to;
        const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId]);
        await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(nft)));

        // Remove a composite key from the balance of the current owner
        const balanceKeyFrom = ctx.stub.createCompositeKey(balancePrefix, [from, tokenId]);
        await ctx.stub.deleteState(balanceKeyFrom);

        // Save a composite key to count the balance of a new owner
        const balanceKeyTo = ctx.stub.createCompositeKey(balancePrefix, [to, tokenId]);
        await ctx.stub.putState(balanceKeyTo, tokenId);

        // Emit the Transfer event
        const tokenIdInt = parseInt(tokenId);
        const transferEvent = { from: from, to: to, tokenId: tokenIdInt };
        ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(transferEvent)));

        return true;
    }
}

module.exports = SafeTokenERC721;
