'use strict';

var LogCtrl         = require('../controllers/log');
var SearchCtrl      = require('../controllers/search');
var RatingCtrl      = require('../controllers/rating');
var TaskCtrl        = require('../controllers/task');

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
    router.post('/rating', RatingCtrl.updateRating);

    // Search resource
    router.get('/search/web', SearchCtrl.searchWeb);
    router.get('/search/news', SearchCtrl.searchNews);
    router.get('/search/images', SearchCtrl.searchImages);
    router.get('/search/videos', SearchCtrl.searchVideos);

    // Task resource
    router.get('/users/:userId/task', TaskCtrl.getTask);
};