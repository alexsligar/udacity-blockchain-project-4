'use strict';

const Blockchain = require('../modules/blockchain/model');

const connectBlockchain = {

    name: 'connectBlockchain',
    register: (server, options) => {
        Blockchain.getChain()
        .then((chain) => {
            console.log('Connected to the blockchain.');
        })
        .catch((err) => {
            console.log(`Couldn't access the blockchain: ${err}`);
            process.exit(1);
        })
    }
    
};

module.exports = connectBlockchain;