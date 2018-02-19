'use strict';

const queryhistory = require('../../../services/session/queryhistory');
const bookmark = require('../../../services/session/bookmark');
const annotation = require('../../../services/session/annotation');
const rating = require('../../../services/session/rating');
const view = require('../../../services/session/view');

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