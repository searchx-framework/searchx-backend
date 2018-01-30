'use strict';

const redis = require('redis');
const bluebird = require("bluebird");
const config = require('../config');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

module.exports = redis.createClient(config.redis);