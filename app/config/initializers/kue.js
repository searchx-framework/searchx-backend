'use strict';

const kue    = require('kue');
const url    = require('url');
const redisUrl = url.parse(process.env.REDIS);

let queue = null;
if(redisUrl.auth){
    queue = kue.createQueue({
        redis: {
            port: redisUrl.port,
            host: redisUrl.hostname,
            auth: redisUrl.auth.split(':')[1]
        }
    });
} else {
    queue = kue.createQueue({
        redis: {
            port: redisUrl.port,
            host: redisUrl.hostname
        }
    });
}

queue.watchStuckJobs();
queue.on('error', function(err){
    console.log('Error: Redis is down: ', err);
});

module.exports = queue;