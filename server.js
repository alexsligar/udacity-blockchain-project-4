'use strict';

const Glue = require('glue');
const Manifest = require('./config/manifest');

const start = async () => {

    try {
        const server = await Glue.compose(Manifest, { relativeTo: __dirname });
        await server.start();
        console.log(`Server running at: ${server.info.uri}`);
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }
};

start();