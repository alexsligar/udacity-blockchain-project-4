'use strict';

const BlockController = require('./controller');

const blockchainRoutes = {
    name: 'blockchainRoutes',
    register: (server, options) => {
        server.route([
            {
                method:'GET',
                path:'/block/{height}',
                handler:BlockController.get
            },
            {
                method:'POST',
                path:'/block',
                handler:BlockController.post
            }
        ]);
    }   
};

module.exports = blockchainRoutes;

