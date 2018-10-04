'use strict';


const Hapi=require('hapi');


//Create the server on port 8000
const server=Hapi.server({
    host:'localhost',
    port:8000
});

const start = async() => {

    try {
        await server.register([require('./config/blockchain'), require('./modules/blockchain/routes')]);
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log(`Server running at: ${server.info.uri}`);
};

start();