'use strict';

const log = require('../../controllers/rest/log');
const search = require('../../controllers/rest/search');
const feature = require('../../controllers/rest/feature');
const session = require('../../controllers/rest/session');

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
    router.get('/search/:vertical', search.search);

    // User resource
    router.get('/users/:userId/task', session.getUserTask);
    router.post('/users/:userId/logs', log.createLog);

    // Session resource
    router.get('/session/:sessionId/query', feature.getQueryHistory);
    router.get('/session/:sessionId/bookmark', feature.getBookmarks);
    router.post('/session/:sessionId/bookmark', feature.addBookmark);
    router.post('/session/:sessionId/bookmark/star', feature.starBookmark);
    router.delete('/session/:sessionId/bookmark', feature.removeBookmark);

    // Document resource
    router.get('/session/:sessionId/annotation', feature.getAnnotation);
    router.post('/session/:sessionId/annotation', feature.addAnnotation);
    router.delete('/session/:sessionId/annotation', feature.removeAnnotation);
};