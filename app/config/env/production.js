'use strict';

module.exports = {
    db: process.env.MONGOLAB_URI,
    url: 'http://api.pienapple.com',
    client: 'http://www.pienapple.com',
    redis: process.env.REDISTOGO_URL,
    elasticsearch: process.env.BONSAI_URL,
    port: 443
};