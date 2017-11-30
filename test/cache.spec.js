'use strict';

// Default to testing environment if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment configurations
var config   = require('../app/config/config');

// Load dependencies
var supertest  = require('supertest');
var should     = require('should');

var Cache = require('../app/models/cache');
var cache = require('../app/controllers/cache');

var mongoose = require('mongoose');
mongoose.connect(config.db);//FIX (deprecated)

describe('cache', function(){
    var query1 = "business"
    var query2 = "business-2";    
    var vertical = "web";
    var page = 2;
    var results1  = {
        'results' : ["RES"],
        'matches' : 1,
        'id': 'id'
    }; 
    var results2  = {
        'results' : ["RES-2"],
        'matches' : 1,
        'id': 'id'
    }; 

    var body = {
        'results' : ["RES"],
        'matches' : 1,
        'id': 'id'
    }

    //before the test runs, make sure the cache is clean
    before(function() {
        Cache.remove({query: query1}, function(err){
            ;
        })
    }); 

    //once the test ran, the cached query should be removed
    after(function() {
        Cache.remove({query: query1}, function(err){
            ;
        })
    }); 

    it('should handle an addition to the cache', function(done){
        var b1 = cache.addSearchResultsToCache(query1, vertical, page, new Date(), results1, body); 
        b1.should.be.true();
        done();
    });

    it('should return the just-added result', function(done){
        cache.getSearchResultsFromCache(query1, vertical, page, function(isHit, res){
            isHit.should.be.true();
            res.should.be.deepEqual(results1);
            done();
        });
    })

    it('should recognize an uncached result', function(done){
        cache.getSearchResultsFromCache(query2, vertical, page, function(isHit, res){
            isHit.should.be.false();
            res.should.deepEqual({});
            done();
        });
    })  

    it('should retrieve the most recent cache entry', function(done){
        cache.addSearchResultsToCache(query1, vertical, page, new Date(), results2, body);

        //give the cache time to incorporate this information        
        setTimeout(function() {
            cache.getSearchResultsFromCache(query1, vertical, page, function(isHit, res){
                isHit.should.be.true();
                res.should.be.deepEqual(results2);
                done();
            });            
        }, 500); 
    })   
    
    it('should reject non-sensical additions to the cache (null as param)', function (done) {
        var b1 = cache.addSearchResultsToCache(null);
        b1.should.be.false();
        done();
    });

    it('should reject non-sensical addition to the cache (result string)', function (done) {
        var b1 = cache.addSearchResultsToCache(query1, vertical, page, new Date(), "RES", body);
        b1.should.be.false();
        done();
    });    

    it('should reject non-sensical addition to the cache (body string)', function (done) {
        var b1 = cache.addSearchResultsToCache(query1, vertical, page, new Date(), results1, "BODY");
        b1.should.be.false();
        done();
    });

    it('should reject non-sensical addition to the cache (function as param)', function (done) {
        var b1 = cache.addSearchResultsToCache(function () { return 1; });
        b1.should.be.false();
        done();
    });    


    it('should reject non-sensical addition to the cache (single string as param)', function (done) {
        var b1 = cache.addSearchResultsToCache("unexpected input");
        b1.should.be.false();
        done();
    });  
    
    it('should reject non-sensical addition to the cache (negative page number in param)', function (done) {
        var b1 = cache.addSearchResultsToCache(query1, vertical, -1000, new Date(), results1, body);
        b1.should.be.false();
        done();
    });    


    it('should reject non-sensical addition to the cache (null query)', function (done) {
        var b1 = cache.addSearchResultsToCache(null, vertical, page, new Date(), results1, body);
        b1.should.be.false();
        done();
    });  
    
    it('should return no cache hit when the input is non-sensical (null query/page)', function (done) {
        cache.getSearchResultsFromCache(null, vertical, null, function (isHit, res) {
            isHit.should.be.false();
            res.should.deepEqual({});
        });
        done();
    })  
    
    it('should return no cache hit when the input is non-sensical (undefined query)', function (done) {
        cache.getSearchResultsFromCache(undefined, vertical, page, function (isHit, res) {
            isHit.should.be.false();
            res.should.deepEqual({});
        });
        done();
    }) 
    

    it('should throw error when the input is non-sensical (lack of params)', function (done) {
        try {
            cache.getSearchResultsFromCache(function (isHit, res) {
                isHit.should.be.false();
                res.should.deepEqual({});
            });
        } catch (e) {
            done();
        }
    })  
    

    it('should return no cache hit when the input is non-sensical (function params)', function (done) {
        cache.getSearchResultsFromCache(function () { }, function () { }, function () { },  function () { }, function (isHit, res) {
            isHit.should.be.false();
            res.should.deepEqual({});
        });
         done();
    })     


    it('should return no cache hit when the input is non-sensical (null page)', function (done) {
        cache.getSearchResultsFromCache(query1, vertical, null, function (isHit, res) {
            isHit.should.be.false();
            res.should.deepEqual({});
        });
        done();
    })     
})

