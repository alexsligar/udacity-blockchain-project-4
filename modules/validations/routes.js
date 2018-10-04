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
            }
        ]);
    }   
};

module.exports = validationsRoutes;