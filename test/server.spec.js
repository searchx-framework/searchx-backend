'use strict';

const supertest  = require('supertest');
const should     = require('should');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const config = require('../app/config/config');
const request = supertest(config.testUrl + ':' + process.env.PORT + '/');

describe('server (requires server to be running)', function() {
    it('should be live', function() {
        request
            .get('/')
            .end(function(err, res) {
                if (err) {
                    throw err;
                }

                res.should.have.status(418);
            });
    });
});