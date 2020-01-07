'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const config = require('../app/config/config');
const mongoose = require('mongoose');
mongoose.connect(config.testDb,  {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;

const should = require('should');
const Cache = require('../app/models/cache');
const cache = require('../app/services/search/cache');

describe('cache', function() {
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
    const providerName = "bing";

    before(function() {
        Cache.remove({query: query1});
    }); 

    after(function() {
        Cache.remove({query: query1});
    });

    ////

    it('should handle an addition to the cache', async function() {
        await cache.addSearchResultsToCache(query1, vertical, page, new Date(), results1, providerName);
    });

    it('should return the just-added result', async function() {
        const res = await cache.getSearchResultsFromCache(query1, vertical, page, providerName);
        res.data.should.be.deepEqual(results1);
    });

    it('should recognize an uncached result', async function() {
        const res = await cache.getSearchResultsFromCache(query2, vertical, page, providerName);
        res.should.be.false();
    });

    it('should retrieve the most recent cache entry', async function() {
        await cache.addSearchResultsToCache(query1, vertical, page, new Date(), results2, providerName);
        const res = await cache.getSearchResultsFromCache(query1, vertical, page, providerName);
        res.data.should.be.deepEqual(results2);
    });
    
    it('should reject non-sensical additions to the cache (null as param)', async function() {
        try {
            await cache.addSearchResultsToCache(null);
        } catch(err) {
            err.name.should.be.exactly('Bad Request');
        }
    });

    it('should reject non-sensical addition to the cache (result string)', async function() {
        try {
            await cache.addSearchResultsToCache(query1, vertical, page, new Date(), "RES", providerName);
        } catch(err) {
            err.name.should.be.exactly('Bad Request');
        }
    });

    it('should reject non-sensical addition to the cache (function as param)', async function() {
        try {
            await cache.addSearchResultsToCache(function() { return 1; });
        } catch(err) {
            err.name.should.be.exactly('Bad Request');
        }
    });    

    it('should reject non-sensical addition to the cache (single string as param)', async function() {
        try {
            await cache.addSearchResultsToCache("unexpected input");
        } catch(err) {
            err.name.should.be.exactly('Bad Request');
        }
    });  
    
    it('should reject non-sensical addition to the cache (negative page number in param)', async function() {
        try {
            await cache.addSearchResultsToCache(query1, vertical, -1000, new Date(), results1, providerName);
        } catch(err) {
            err.name.should.be.exactly('Bad Request');
        }
    });    

    it('should reject non-sensical addition to the cache (null query)', async function() {
        try {
            await cache.addSearchResultsToCache(null, vertical, page, new Date(), results1, providerName);
        } catch(err) {
            err.name.should.be.exactly('Bad Request');
        }
    });  
    
    it('should throw an error when the input is non-sensical (null query/page)', async function() {
        try {
            await cache.getSearchResultsFromCache(null, vertical, null, providerName);
        } catch (err) {
            err.name.should.be.exactly('Bad Request');
        }
    });
    
    it('should throw an error when the input is non-sensical (undefined query)', async function() {
        try {
            await cache.getSearchResultsFromCache(undefined, vertical, page, providerName);
        } catch(err) {
            err.name.should.be.exactly('Bad Request');
        }
    });
    

    it('should throw an error when the input is non-sensical (lack of params)', async function() {
        try {
            await cache.getSearchResultsFromCache();
        } catch(err) {
            err.name.should.be.exactly('Bad Request');
        }
    });
    

    it('should throw an error when the input is non-sensical (function params)', async function() {
        try {
            await cache.getSearchResultsFromCache(function() {}, function() {}, function() {}, function() {});
        } catch(err) {
            err.name.should.be.exactly('Bad Request');
        }
    });


    it('should throw an error when the input is non-sensical (null page)', async function() {
        try {
            await cache.getSearchResultsFromCache(query1, vertical, null, providerName);
        } catch(err) {
            err.name.should.be.exactly('Bad Request');
        }
    })     
});

