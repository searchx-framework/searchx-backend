'use strict';

const LogCtrl         = require('../../controllers/log');
const SearchCtrl      = require('../../controllers/search');
const SessionCtrl     = require('../../controllers/session');
const TaskCtrl        = require('../../controllers/task');

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
    router.get('/search/:vertical', SearchCtrl.search);

    // User resource
    router.get('/users/:userId/task', TaskCtrl.getUserTask);
    router.post('/users/:userId/logs', LogCtrl.createLog);

    // Session resource
    router.get('/session/:sessionId/bookmark', SessionCtrl.getBookmarks);
    router.post('/session/:sessionId/bookmark', SessionCtrl.addBookmark);
    router.post('/session/:sessionId/bookmark/star', SessionCtrl.starBookmark);
    router.delete('/session/:sessionId/bookmark', SessionCtrl.removeBookmark);
    router.get('/session/:sessionId/query', SessionCtrl.getQueryHistory);
};