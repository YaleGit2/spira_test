'use strict';

const MAGIC_NUMBER = 0xcd740db5;
class ERC721Receiver {
    onERC721Received(ctx, _operator, _from, _tokenId, _data) {
        return MAGIC_NUMBER;
    }
}

module.exports.ERC721Receiver = ERC721Receiver;
module.exports.ERC721_RECEIVER_MAGIC_NUMBER = MAGIC_NUMBER;
