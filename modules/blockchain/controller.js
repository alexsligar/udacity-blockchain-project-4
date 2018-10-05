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
 * Post a new block to the chain
 */
exports.postBlock = (req, h) => {

    return Validation.checkEligible(req.payload.address)
    .then(() => {

        return Blockchain.addBlock(req.payload.address, req.payload.star)
    })
    .then(async (block) => {

        const address = JSON.parse(block).body.address;
        await Validation.removeValidation(address);

        return h.response(JSON.parse(block)).code(201);

    })
    .catch((err) => {

        console.log(err);
        let data =  { err: err };
        return h.response(data).code(400);

    });

};