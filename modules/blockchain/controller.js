'use strict';

const Blockchain = require('./model');

/**
 * Get block by height
 */
exports.get = (req, h) => {


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
exports.post = (req, h) => {


    return Blockchain.addBlock(req.payload.body)
    .then((block) => {


        return h.response(JSON.parse(block)).code(201);


    })
    .catch((err) => {


        let data =  { err: err };
        return h.response(data).code(400);


    });

};