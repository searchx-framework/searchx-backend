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
describe('Search resource', function() {

    it('should handle web search', function(done) {
        request
            .get('/search/web')
            .query({
                query: 'business',
                page: 1
            })
            .end(function(err, res) {
                
                if (err) {
                    throw err;
                }
                should(res).have.property('status',200);
                should(res).have.property('body');
                should(res.body).have.property('results');
                should(res.body.results.length).be.exactly(10);
                done();
            });
    });

    it('should handle news search', function(done) {
        request
            .get('/search/news')
            .query({
                query: 'business',
                page: 1
            })
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                should(res).have.property('status',200);
                should(res).have.property('body');
                should(res.body).have.property('results');
                should(res.body.results.length).be.exactly(10);
                done();
            });
    });

    it('should handle image search', function(done) {
        request
            .get('/search/images')
            .query({
                query: 'business',
                page: 1
            })
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                should(res).have.property('status',200);
                should(res).have.property('body');
                should(res.body).have.property('results');
                should(res.body.results.length).be.exactly(12);
                done();
            });
    });

    it('should handle video search', function(done) {
        request
            .get('/search/videos')
            .query({
                query: 'business',
                page: 1
            })
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                should(res).have.property('status',200);
                should(res).have.property('body');
                should(res.body).have.property('results');
                should(res.body.results.length).be.exactly(12);
                done();
            });
    });

});