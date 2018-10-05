'use strict';

const Joi = require('joi');

const ValidationsController = require('./controller');

const validationsRoutes = {
    name: 'validationsRoutes',
    register: (server, options) => {

        server.route([
            {
                method:'POST',
                path:'/validationRequest',
                handler:ValidationsController.post,
                options: {
                    validate: {
                        payload: {
                            address: Joi.string().min(26).max(35).required()
                        }
                    }
                }
            },
            {
                method: 'POST',
                path: '/message-signature/validate',
                handler:ValidationsController.validate,
                options: {
                    validate: {
                        payload: {
                            address: Joi.string().min(26).max(35).required(),
                            signature: Joi.string().min(70).max(100).required()
                        }
                    }
                }
            }
        ]);
    }   
};

module.exports = validationsRoutes;