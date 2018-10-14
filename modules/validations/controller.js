'use strict';

const Validation = require('./model');

/**
 * Post a new request by address
 */
exports.post = (req, h) => {

    return Validation.addValidationRequest(req.payload.address)
    .then((validationRequest) => {

        return h.response(validationRequest).code(201);
    })
    .catch((err) => {

        let data =  { err: err.message };
        return h.response(data).code(400);
    });

};

/**
 * Post a signature validating message
 */
exports.validate = (req, h) => {

    return Validation.validateRequest(req.payload.address, req.payload.signature)
    .then((validatedRequest) => {

        return h.response(validatedRequest).code(200);
    })
    .catch((err) => {

        let data =  { err: err };
        return h.response(data).code(400);
    });

};
