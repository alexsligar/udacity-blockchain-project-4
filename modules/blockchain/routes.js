'use strict';

const Joi = require('joi');

const BlockController = require('./controller');

const blockchainRoutes = {
    name: 'blockchainRoutes',
    register: (server, options) => {
        server.route([
            {
                method:'GET',
                path:'/block/{height}',
                handler:BlockController.getBlock
            },
            {
                method:'GET',
                path:'/stars/address:{address}',
                handler:BlockController.getStars,
                options: {
                    validate: {
                        params: {
                            address: Joi.string().min(26).max(35).required()
                        }
                    }
                }
            },
            {
                method:'POST',
                path:'/block',
                handler:BlockController.postBlock,
                options: {
                    validate: {
                        payload: {
                            address: Joi.string().min(26).max(35).required(),
                            star: {
                                ra: Joi.string().required(),
                                dec: Joi.string().required(),
                                mag: Joi.string(),
                                cen: Joi.string(),
                                story: Joi.string().max(500)
                            }
                        }
                    }
                }
            }
        ]);
    }   
};

module.exports = blockchainRoutes;

