'use strict';

const Validation = require('../validations/model');
const Blockchain = require('./model');

/**
 * Get block by height
 */
exports.getBlock = (req, h) => {


    return Blockchain.getBlock(req.params.height)
    .then((block) => {


        return JSON.parse(block);


    })
    .catch((err) => {

        let data = { err: err.message };
        return h.response(data).code(404);
        

    });
};

/**
 * Get all stars based on a wallet address
 */
exports.getStars = (req, h) => {

    return Blockchain.getStars(req.params.address)
    .then((stars) => {

        return stars;
    })
    .catch((err) => {

        let data = { err: err.message };
        return h.response(data).code(404);
    });
};

/**
 * Get block based on hash
 */
exports.getHash = (req, h) => {

    return Blockchain.getHash(req.params.hash)
    .then((block) => {

        return block;
    })
    .catch((err) => {

        let data = { err: err.message };
        return h.response(data).code(404);
    });
};

/**
 * Post a new block to the chain
 */
exports.postBlock = (req, h) => {

    //check that the address is eligible to add a star
    return Validation.checkEligible(req.payload.address)
    .then(() => {

        return Blockchain.addBlock(req.payload.address, req.payload.star)
    })
    .then(async (block) => {

        const address = JSON.parse(block).body.address;
        //make sure a second star can't be added on the request
        await Validation.removeValidation(address);
        return h.response(JSON.parse(block)).code(201);

    })
    .catch((err) => {

        let data =  { err: err };
        return h.response(data).code(400);

    });

};