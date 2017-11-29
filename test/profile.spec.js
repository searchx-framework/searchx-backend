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

var Profile = require('../app/models/profile');
var ProfileCrl = require('../app/controllers/profile');


// Test the resource
describe('Profile resource', function() {

        //before the test runs, make sure the cache is clean
    before(function() {
        Profile.remove({userId: "123"}, function(err){
            ;
        })
    }); 

    //once the test ran, the cached query should be removed
    after(function() {
        Profile.remove({userId: "123"}, function(err){
            ;
        })
    }); 



    it('should handle get profile false', function(done) {
        request
            .get('/users/123/profile')
            .query({
                taskId: 'T1'
            })
            .end(function(err, res) {
                
                if (err) {
                    throw err;
                }
                should(res.body).have.property('found').be.equal(false);
                done();
            });
    });

    it('should handle get profile true', function(done) {
        request
            .get('/users/123/profile')
            .query({
                taskId: 'T2'
            })
            .end(function(err, res) {
                
                if (err) {
                    throw err;
                }
                should(res.body).have.property('found').be.equal(true);
                done();
            });
    });
});