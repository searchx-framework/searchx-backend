'use strict';


// Init
var config = require('./app/config/config');
require('./app/config/initializers/mongoose')(config.db);


// Create Job Queue
var queue  = require('./app/config/initializers/kue');
var domain = require('domain');

function wrapInDomain(workerFunction){
    return function(job, done){
        var d = domain.create();
        d.on('error', function(err){
            console.log('Error in domain: ', err);
            console.log('Error in domain error stringified: ', JSON.stringify(err));
            job.log('Error in domain: ' + JSON.stringify(err));
            done(new Error(err));
        });
        d.run(function(){
            return workerFunction(job, done);
        });
    };
}


// Define workers
console.log('Starting Workers');

var pageScraper = require('./app/workers/pageScraper');
queue.process('scrap_page', 3, pageScraper.processScrap);
queue.process('scrap_screenshot', 3, pageScraper.processScreenshot);


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
