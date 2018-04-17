'use strict';

// Init
require('../app/config/initializers/mongoose')(process.env.DB);

// Create Job Queue
const queue  = require('../app/config/initializers/kue');

// Handle termination
process.once('SIGTERM', function(){
    console.log('worker.js: SIGTERM received');
    setTimeout(function(){
        console.log('worker.js: finishing existing jobs');
        queue.shutdown(function(){
            console.log('worker.js: all jobs finished.');
            console.log('worker.js: Kue has been shut down.');
            process.exit(0);
        });
    }, 10000);
});

// Define workers
console.log('Starting Workers');

const workers = require('../app/api/worker');
queue.process('scrap_page', 3, workers.processScrapPage);