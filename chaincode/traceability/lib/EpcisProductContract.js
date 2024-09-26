'use strict';

const TokenERC998ERC721TopDown = require('./tokens/tokenERC998.js');
const { Context } = require('fabric-contract-api');
const EpcisProductList = require('./products/EpcisProductList.js');
const EpcisProduct = require('./products/EpcisProduct.js');
const { EventType, ActionType } = require('./events/EpcisEvent.js');
const schema = require('./events/epcisEventSchema.json');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv();
addFormats(ajv);

class EpcisProductContext extends Context {
    constructor() {
        super();
        this.productList = new EpcisProductList(this);
    }
}
class EpcisProductContract extends TokenERC998ERC721TopDown {
    constructor() {
        super('org.epcis.EpcisProductContract');
    }

    createContext() {
        return new EpcisProductContext();
    }

    async instantiate(/*ctx*/) {
        console.log('EPCIS product contract instantiated');
    }

    async getProduct(ctx, id) {
        return await ctx.productList.getProduct(id);
    }

    async checkProductList(ctx, productList) {
        const productListArray = productList.split(',');
        return await Promise.all( productListArray.map( async (id) => {
            const product = await ctx.productList.getProduct(id);
            return {
                id,
                found: product ? true : false
            };
        }));
    }

    async Initialize(ctx, name, symbol) {
        return await super.Initialize(ctx, name, symbol);
    }

    async onEvent(ctx, data) {
        const event = JSON.parse(data);
        if (!ajv.validate(schema, event)) {
            throw new Error('Data format not valid');
        }

        let productIdList = [];
        if (event.type === EventType.AGGREGATION) {
            const childExistingList = await Promise.all(event.childEPCs.map( async (childEPCId) => await this._nftExists(ctx, childEPCId)));
            if (childExistingList.includes(false)) {
                throw new Error('Some of the childEPC elements does not exist. Add object event first');
            }
            productIdList = event.childEPCs.concat(event.parentID);
        }
        if (event.type === EventType.OBJECT) {
            productIdList = event.epcList;
        }
        if (event.type === EventType.TRANSFORMATION) {
            productIdList = event.inputEPCList.concat(event.outputEPCList);
        }
        const eventProducts = await EpcisProductContract.parseProducts(ctx, productIdList);

        await Promise.all(eventProducts.toCreate.map( async (product) => {
            product.eventList = [EpcisProductContract.getEventPayload(ctx, event)];
            if (event.type === EventType.TRANSFORMATION) {
                const parentProducts = eventProducts.toUpdate.filter(p => event.inputEPCList.includes(p.productId));
                for (let i=0; i<parentProducts.length; i++) {
                    product.eventList = product.eventList.concat(parentProducts[i].eventList);
                }
            }
            await ctx.productList.addProduct(product);
            await this.MintWithTokenURI(ctx, product.productId, ''); // TODO: define which info will be the URL
        }));

        await Promise.all(eventProducts.toUpdate.map( async (product) => {
            product.eventList.push(EpcisProductContract.getEventPayload(ctx, event));
            await ctx.productList.updateProduct(product);

            await EpcisProductContract.updateNestedProducts(ctx, product.productId, event);
        }));

        if (event.type === EventType.AGGREGATION && event.action !== ActionType.DELETE) {
            await Promise.all(event.childEPCs.map( async (childProductId) => {
                const owner = await this.OwnerOf(ctx, childProductId);
                await this.TransferFrom(ctx, owner, event.parentID, childProductId);
            }));
        }

        if (event.type === EventType.OBJECT && event.action === ActionType.DELETE) {
            event.childEPCs.map( async (childProductId) => {
                await this.Burn(ctx, childProductId.productId);
            });
        }

        if (event.type === EventType.AGGREGATION && event.action === ActionType.DELETE) {
            event.childEPCs.map( async (childProductId) => {
                const owner = await this.OwnerOf(ctx, childProductId);
                const newOwner = ctx.clientIdentity.getID();
                await this.TransferFrom(ctx, owner, newOwner, childProductId);
            });
        }
    }

    static async parseProducts(ctx, productIdList) {
        let response = {
            toCreate: [],
            toUpdate: []
        };
        if (!productIdList) {
            return response;
        }

        await Promise.all(productIdList.map( async (productId) => {
            const product = await ctx.productList.getProduct(productId);

            if (!product) {
                response.toCreate.push(await EpcisProduct.createInstance({
                    productId,
                    eventList: []
                }));
            }
            else {
                response.toUpdate.push(product);
            }
        }));

        return response;
    }

    static getEventPayload(ctx, event) {
        return {
            eventID: event.eventID,
            eventTime: event.eventTime,
            type: event.type,
            action: event.action,
            createTime: ctx.stub.getTxTimestamp(),
            creator: ctx.stub.getCreator(),
            transactionId: ctx.stub.getTxID()
        };
    }

    static async updateNestedProducts(ctx, productId, event) {
        const iterator = await ctx.stub.getStateByPartialCompositeKey('balance', [productId]); // TODO: manage prefix from parent contracts
        let result = await iterator.next();
        while (!result.done) {
            const childProduct = await ctx.productList.getProduct(result.value.value.toString());
            childProduct.eventList.push(EpcisProductContract.getEventPayload(ctx, event));
            await ctx.productList.updateProduct(childProduct);

            result = await iterator.next();

            await EpcisProductContract.updateNestedProducts(ctx, childProduct.productId, event);
        }
        return;
    }
}

module.exports = EpcisProductContract;
