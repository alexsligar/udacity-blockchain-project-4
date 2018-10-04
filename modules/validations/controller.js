
/**
 * Post a new block to the chain
 */
exports.post = (req, h) => {


    return req.server.app.validations.addRequest(req.payload)
    .then((validationRequest) => {


        return h.response(JSON.parse(validationRequest)).code(201);


    })
    .catch((err) => {


        let data =  { err: err };
        return h.response(data).code(400);


    });

};