'use strict';

// Default to testing environment if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment configurations
var config   = require('../app/config/config');

// Load dependencies
var supertest  = require('supertest');
var should     = require('should');
var shouldHttp = require('should-http');
var request    = supertest(config.url + ':' + config.port + '/v1');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Test the resource
describe('api root endpoint', function() {
    it('should be live', function(done) {
        request
            .get('/')
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                res.should.have.status(418);
                done();
            });
    });
});