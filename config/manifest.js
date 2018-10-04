'use strict';

const manifest = {
    server: {
        port: 8000
    },
    register: {
        plugins: [
            './config/blockchain',
            './modules/blockchain/routes',
            './modules/validations/routes'
        ]
    }
}

module.exports = manifest;