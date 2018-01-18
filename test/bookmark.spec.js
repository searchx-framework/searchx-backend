'use strict';

// Default to testing environment if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment configurations
const config   = require('../app/config/config');

// Load dependencies
const supertest  = require('supertest');
const should     = require('should');
const shouldHttp = require('should-http');
const request    = supertest(config.url + ':' + config.port + '/v1');

const session = require('../app/models/session');
const bookmark = session.bookmark;
const User = require('../app/models/user');
const BookmarkService = require('../app/service/session');

const mongoose = require('mongoose');
mongoose.connect(config.db);//FIX (deprecated)

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';



// Test the resource
describe('Bookmark resource', function() {
  
    const bookmark1  = {
         url : "https://www.test.nl",
         title : "teste",
         userId : '908727'
    }; 

  
    const bookmark2  = {
        url : "https://www.test.nl",
        title : "teste",
        userId : '908727'
   }; 

    //before the test runs, make sure the cache is clean
    before(function() {
        bookmark.remove({url: bookmark1.url, userId: bookmark1.userId}, function(err){
            ;
        })
    }); 

    //once the test ran, the cached query should be removed
    after(function() {
        bookmark.remove({url: bookmark1.url, userId: bookmark1.userId}, function(err){
            ;
        })
    }); 

    it('should handle bookmark insert 1', function(done) {
        request
            .post('/bookmark')
            .send(bookmark1)
            .expect(201)
            .end(function (err, res) { 
                if (err) return done(err);
                done();
            });
    });

    it('should handle bookmark insert 2', function(done) {
        request
            .post('/bookmark')
            .send(bookmark2)
            .expect(201)
            .end(function (err, res) { 
                if (err) return done(err);
                done();
            });
    });

    it('should return correct bookmark for url', function(done) {
        BookmarkService.getBookmark(bookmark1.userId, bookmark1.url)
            .then((r) => {
                r.toObject().should.be.exactly(bookmark1);
                done();
            });
    });
});