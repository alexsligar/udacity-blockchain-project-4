'use strict';

const ValidationsController = require('./controller');

const validationsRoutes = {
    name: 'validationsRoutes',
    register: (server, options) => {

        server.route([
            {
                method:'POST',
                path:'/validationRequest',
                handler:ValidationsController.post
            },
            {
                method: 'POST',
                path: '/message-signature/validate',
                handler:ValidationsController.validate
            }
        ]);
    }   
};

module.exports = validationsRoutes;