'use strict';

const LogCtrl         = require('../../controllers/rest/log');
const SearchCtrl      = require('../../controllers/rest/search');
const SessionCtrl     = require('../../controllers/rest/session');
const TaskCtrl        = require('../../controllers/rest/task');

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
    router.get('/session/:sessionId/query', SessionCtrl.getQueryHistory);
    router.get('/session/:sessionId/bookmark', SessionCtrl.getBookmarks);
    router.post('/session/:sessionId/bookmark', SessionCtrl.addBookmark);
    router.post('/session/:sessionId/bookmark/star', SessionCtrl.starBookmark);
    router.delete('/session/:sessionId/bookmark', SessionCtrl.removeBookmark);

    // Document resource
    router.get('/session/:sessionId/annotation', SessionCtrl.getAnnotation);
    router.post('/session/:sessionId/annotation', SessionCtrl.addAnnotation);
    router.delete('/session/:sessionId/annotation', SessionCtrl.removeAnnotation);
};