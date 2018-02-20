'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const config = require('../app/config/config');
const mongoose = require('mongoose');
mongoose.connect(config.db, {useMongoClient: true});
mongoose.Promise = global.Promise;

const supertest = require('supertest');
const should = require('should');

const Cache = require('../app/models/cache');
const cache = require('../app/services/search/cache');

describe('cache', function(){
    const query1 = "business";
    const query2 = "business-2";
    const vertical = "web";
    const page = 2;
    const results1  = {
        'results' : ["RES"],
        'matches' : 1,
        'id': 'id'
    }; 
    const results2  = {
        'results' : ["RES-2"],
        'matches' : 1,
        'id': 'id'
    };

    ////

    before(function() {
        Cache.remove({query: query1});
    }); 

    after(function() {
        Cache.remove({query: query1});
    });

    ////

    it('should handle an addition to the cache', async function(done){
        try {
            await cache.addSearchResultsToCache(query1, vertical, page, new Date(), results1);
            done();
        } catch(err) {
            console.log(err);
        }
    });

    it('should return the just-added result', async function(done){
        const res = await cache.getSearchResultsFromCache(query1, vertical, page);
        res.data.should.be.deepEqual(results1);
        done();
    });

    it('should recognize an uncached result', async function(done){
        const res = await cache.getSearchResultsFromCache(query2, vertical, page);
        res.should.be.false();
        done();
    });

    it('should retrieve the most recent cache entry', async function(done){
        await cache.addSearchResultsToCache(query1, vertical, page, new Date(), results2);
        const res = await cache.getSearchResultsFromCache(query1, vertical, page);
        res.data.should.be.deepEqual(results2);
        done();
    });
    
    it('should reject non-sensical additions to the cache (null as param)', async function (done) {
        try {
            await cache.addSearchResultsToCache(null);
        } catch(err) {
            done();
        }
    });

    it('should reject non-sensical addition to the cache (result string)', async function (done) {
        try {
            await cache.addSearchResultsToCache(query1, vertical, page, new Date(), "RES");
        } catch(err) {
            done();
        }
    });

    it('should reject non-sensical addition to the cache (function as param)', async function (done) {
        try {
            await cache.addSearchResultsToCache(function () { return 1; });
        } catch(err) {
            done();
        }
    });    

    it('should reject non-sensical addition to the cache (single string as param)', async function (done) {
        try {
            await cache.addSearchResultsToCache("unexpected input");
        } catch(err) {
            done();
        }
    });  
    
    it('should reject non-sensical addition to the cache (negative page number in param)', async function (done) {
        try {
            await cache.addSearchResultsToCache(query1, vertical, -1000, new Date(), results1);
        } catch(err) {
            done();
        }
    });    

    it('should reject non-sensical addition to the cache (null query)', async function (done) {
        try {
            await cache.addSearchResultsToCache(null, vertical, page, new Date(), results1);
        } catch(err) {
            done();
        }
    });  
    
    it('should throw an error when the input is non-sensical (null query/page)', async function (done) {
        try {
            await cache.getSearchResultsFromCache(null, vertical, null);
        } catch (err) {
            done();
        }
    });
    
    it('should throw an error when the input is non-sensical (undefined query)', async function (done) {
        try {
            await cache.getSearchResultsFromCache(undefined, vertical, page);
        } catch(err) {
            done();
        }
    });
    

    it('should throw an error when the input is non-sensical (lack of params)', async function (done) {
        try {
            await cache.getSearchResultsFromCache();
        } catch(err) {
            done();
        }
    });
    

    it('should throw an error when the input is non-sensical (function params)', async function (done) {
        try {
            await cache.getSearchResultsFromCache(function(){}, function(){}, function(){});
        } catch(err) {
            done();
        }
    });


    it('should throw an error when the input is non-sensical (null page)', async function (done) {
        try {
            await cache.getSearchResultsFromCache(query1, vertical, null);
        } catch(err) {
            done();
        }
    })     
});

