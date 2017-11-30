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


var Rating = require('../app/models/rating');
var User = require('../app/models/user');
var RatingCrl = require('../app/controllers/rating');

var mongoose = require('mongoose');
mongoose.connect(config.db);//FIX (deprecated)

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';



// Test the resource
describe('Rating resource', function() {
  
    var rating1  = {
         vertical : "web", 
         url : "https://www.test.nl",
         userId : '908727',
         discount: 1,
         serpId: "S",
         signal: "up"
    }; 

    var rating2  = {
         vertical : "web", 
         url : "https://www.test.nl",
         userId : '908728',
         discount: 1,
         serpId: "S",
         signal: "up"
    }; 

    //before the test runs, make sure the cache is clean
    before(function() {
        Rating.remove({url: rating1.url}, function(err){
            ;
        })
    }); 

    //once the test ran, the cached query should be removed
    after(function() {
        Rating.remove({url: rating1.url}, function(err){
            ;
        })
    }); 

    it('should handle rating insert 1', function(done) {
        request
            .post('/rating')
            .send(rating1)
            .expect(201)
            .end(function (err, res) { 
                if (err) return done(err);
                done();
            });
    });

    it('should handle rating insert 2', function(done) {
        request
            .post('/rating')
            .send(rating2)
            .expect(201)
            .end(function (err, res) { 
                if (err) return done(err);
                done();
            });
    });

    it('should return correct rating number for url', function(done) {
        RatingCrl.getRating(rating1.vertical,rating1.url,
            function(r) {
                r.should.be.exactly(2);
                done();
            }
        );
        
    });


    it('should return correct user signal for url', function(done) {
        RatingCrl.userHasRated(rating1.vertical, rating1.url, rating1.userId,
            function (b){
                b.should.be.equal("up");
                done();
            }
        );
    });


});