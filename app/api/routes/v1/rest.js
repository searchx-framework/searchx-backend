'use strict';

const LogCtrl         = require('../../controllers/rest/log');
const SearchCtrl      = require('../../controllers/rest/search');
const FeatureCtrl     = require('../../controllers/rest/feature');
const SessionCtrl     = require('../../controllers/rest/session');
const SuggestionsCtrl = require('../../controllers/rest/suggestions');

module.exports = function(router) {
    router.use(function(req, res, next) {
       res.header('Content-Type', 'application/json');
       next();
    });

    // Search
    router.get('/search/:vertical', SearchCtrl.search);
    router.get('/search/:vertical/getById/:id', SearchCtrl.getById);

    // Suggestions
    router.get('/suggestions', SuggestionsCtrl.suggestions);

    // User
    router.get('/users/:userId/task/:task', SessionCtrl.getUserTask);
    router.get('/users/:userId/task/:task/data', SessionCtrl.getUserData);
    router.get('/users/:userId/group', SessionCtrl.getUserGroup);
    router.post('/users/:userId/logs', LogCtrl.insertLogs);
    router.post('/users/:userId/task/:task/topic', SessionCtrl.postUserTask);
    // Feature
    router.get('/session/:sessionId/query', FeatureCtrl.getQueryHistory);
    router.get('/session/:sessionId/bookmark', FeatureCtrl.getBookmarks);
    router.get('/session/:sessionId/exclude', FeatureCtrl.getExcludes);
    router.post('/session/:sessionId/bookmark', FeatureCtrl.addBookmark);
    router.post('/session/:sessionId/exclude', FeatureCtrl.addExclude);
    router.post('/session/:sessionId/bookmark/star', FeatureCtrl.starBookmark);
    router.delete('/session/:sessionId/bookmark', FeatureCtrl.removeBookmark);
    router.delete('/session/:sessionId/exclude', FeatureCtrl.removeExclude);
    router.get('/session/:sessionId/annotation', FeatureCtrl.getAnnotation);
    router.post('/session/:sessionId/annotation', FeatureCtrl.addAnnotation);
    router.delete('/session/:sessionId/annotation', FeatureCtrl.removeAnnotation);
    router.get('/session/:sessionId/rating', FeatureCtrl.getRating);
    router.post('/session/:sessionId/rating', FeatureCtrl.submitRating);
    router.get('/session/:sessionId/chat', FeatureCtrl.getChatMessageList);
    router.post('/session/:sessionId/chat', FeatureCtrl.addChatMessage);
};
