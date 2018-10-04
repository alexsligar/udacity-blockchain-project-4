'use strict';

const Validation = require('./model');

/**
 * Post a new block to the chain
 */
exports.post = (req, h) => {

    return Validation.addRequest(req.payload.address)
    .then((validationRequest) => {

        return h.response(validationRequest).code(201);

    })
    .catch((err) => {

        console.log(err);
        let data =  { err: err };
        return h.response(data).code(400);

    });

};