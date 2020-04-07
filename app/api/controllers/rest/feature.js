'use strict';

const queryhistory = require('../../../services/features/queryhistory');
const bookmark = require('../../../services/features/bookmark');
const annotation = require('../../../services/features/annotation');
const rating = require('../../../services/features/rating');
const chat = require('../../../services/features/chat')

const resolve = function(req, res, promise, errorMessage) {
    promise
        .then((data) => {
            res.status(201).json({
                error: false,
                results: data
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(401).json({
                error: true,
                message: errorMessage
            });
        });
};

//// QUERY HISTORY

exports.getQueryHistory = function(req, res) {
    const sessionId = req.params.sessionId;
    resolve(req, res,
        queryhistory.getQueryHistory(sessionId),
        'Could not get query history.'
    );
};

//// BOOKMARKS

exports.getBookmarks = function(req, res) {
    const sessionId = req.params.sessionId;
    resolve(req, res,
        bookmark.getBookmarks(sessionId),
        'Could not get bookmarks.'
    );
};

exports.addBookmark = function(req, res) {
    const data = req.body;
    const sessionId = req.params.sessionId;
    resolve(req, res,
        bookmark.addBookmark(sessionId, data),
        'Could not create a new bookmark.'
    );
};

exports.removeBookmark = function(req,res) {
    const url = req.body.url;
    const sessionId = req.params.sessionId;
    resolve(req, res,
        bookmark.removeBookmark(sessionId, url),
        'Could not delete bookmark.'
    );
};

exports.getExcludes = function(req, res) {
    const sessionId = req.params.sessionId;
    resolve(req, res,
        bookmark.getBookmarks(sessionId, true),
        'Could not get excludes.'
    );
};

exports.addExclude = function(req, res) {
    const data = req.body;
    const sessionId = req.params.sessionId;
    resolve(req, res,
        bookmark.addBookmark(sessionId, data, true),
        'Could not create a new exclude.'
    );
};

exports.removeExclude = function(req,res) {
    const url = req.body.url;
    const sessionId = req.params.sessionId;
    resolve(req, res,
        bookmark.removeBookmark(sessionId, url, true),
        'Could not delete exclude.'
    );
};

exports.starBookmark = function(req, res) {
    const url = req.body.url;
    const sessionId = req.params.sessionId;
    resolve(req, res,
        bookmark.starBookmark(sessionId, url),
        'Could not star/unstar bookmark.'
    );
};

//// ANNOTATIONS

exports.getAnnotation = function(req, res) {
    const sessionId = req.params.sessionId;
    const url = req.query.url;
    resolve(req, res,
        annotation.getAnnotations(sessionId, url),
        'Could not get annotations.'
    );
};

exports.addAnnotation = function(req, res) {
    const sessionId = req.params.sessionId;
    const data = req.body;
    resolve(req, res,
        annotation.addAnnotation(sessionId, data),
        'Could not create a new annotation.'
    );
};

exports.removeAnnotation = function(req, res) {
    const sessionId = req.params.sessionId;
    const url = req.body.url;
    const annotationId = req.body.annotationId;
    resolve(req, res,
        annotation.removeAnnotation(sessionId, url, annotationId),
        'Could not delete annotation.'
    );
};

//// RATING

exports.getRating = function(req, res) {
    const sessionId = req.params.sessionId;
    const url = req.query.url;
    const userId = req.query.userId;
    resolve(req, res,
        rating.getRating(sessionId, url, userId),
        'Could not get ratings.'
    );
};

exports.submitRating = function(req, res) {
    const sessionId = req.params.sessionId;
    const data = req.body;
    resolve(req, res,
        rating.submitRating(sessionId, data),
        'Could not save rating data.'
    );
};


//// CHAT

exports.getChatMessageList = function(req, res) {
    const sessionId = req.params.sessionId;
    resolve(req, res,
        chat.getChatMessageList(sessionId),
        'Could not get ratings.'
    );
};

exports.addChatMessage = function(req, res) {
    const sessionId = req.params.sessionId;
    const data = req.body;
    resolve(req, res,
        chat.addChatMessage(sessionId, data),
        'Could not save rating data.'
    );
};