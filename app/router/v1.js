'use strict';

const LogCtrl         = require('../controllers/log');
const SearchCtrl      = require('../controllers/search');
const BookmarkCtrl    = require('../controllers/bookmark');
const TaskCtrl        = require('../controllers/task');

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

    // Search resource
    router.get('/search/web', SearchCtrl.searchWeb);
    router.get('/search/news', SearchCtrl.searchNews);
    router.get('/search/images', SearchCtrl.searchImages);
    router.get('/search/videos', SearchCtrl.searchVideos);

    // User resource
    router.post('/users/:userId/logs', LogCtrl.createLog);

    // Task Resource
    router.get('/task/:userId', TaskCtrl.getUserTask);

    // Bookmark resource
    router.post('/bookmark/', BookmarkCtrl.addBookmark);
    router.get('/bookmark/:userId/', BookmarkCtrl.getBookmarks);
    router.delete('/bookmark/', BookmarkCtrl.removeBookmark);
};