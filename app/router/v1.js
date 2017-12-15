'use strict';

var LogCtrl         = require('../controllers/log');
var SearchCtrl      = require('../controllers/search');
var BookmarkCtrl      = require('../controllers/bookmark');

module.exports = function(router) {
    // Set Content-Type for all responses
    router.use(function(req, res, next) {
       res.header('Content-Type', 'application/json');
       next();
    });

    // Test response
    router.get('/', function(req, res) {
        res.status(418).json({
            error: false,
            message: 'The API is up and running.'
        });
    });

    // User resource
    router.post('/users/:userId/logs', LogCtrl.createLog);

    // Search resource
    router.get('/search/web', SearchCtrl.searchWeb);
    router.get('/search/news', SearchCtrl.searchNews);
    router.get('/search/images', SearchCtrl.searchImages);
    router.get('/search/videos', SearchCtrl.searchVideos);

    // Bookmark resource
    router.post('/bookmark/', BookmarkCtrl.addBookmark);
    router.get('/bookmark/:userId/', BookmarkCtrl.getBookmarks);
    router.delete('/bookmark/', BookmarkCtrl.removeBookmark);
};