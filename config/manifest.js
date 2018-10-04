'use strict';

const manifest = {
    server: {
        port: 8000
    },
    register: {
        plugins: [
            './config/blockchain',
            './modules/blockchain/routes'
        ]
    }
}

module.exports = manifest;