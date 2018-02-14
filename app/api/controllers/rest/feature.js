'use strict';

const queryhistory = require('../../../services/feature/queryhistory');
const bookmark = require('../../../services/feature/bookmark');
const annotation = require('../../../services/feature/annotation');

const resolve = function(promise, res, errorMessage) {
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
    resolve(
        queryhistory.getQueryHistory(sessionId),
        res, 'Could not get query history.'
    );
};

//// BOOKMARKS

exports.getBookmarks = function(req, res) {
    const sessionId = req.params.sessionId;
    resolve(
        bookmark.getBookmarks(sessionId),
        res, 'Could not get bookmarks.'
    );
};

exports.addBookmark = function(req, res) {
    const data = req.body;
    const sessionId = req.params.sessionId;
    resolve(
        bookmark.addBookmark(sessionId, data),
        res, 'Could not create a new bookmark.'
    );
};

exports.removeBookmark = function(req,res) {
    const url = req.body.url;
    const sessionId = req.params.sessionId;
    resolve(
        bookmark.removeBookmark(sessionId, url),
        res, 'Could not delete bookmark.'
    );
};

exports.starBookmark = function(req, res) {
    const url = req.body.url;
    const sessionId = req.params.sessionId;
    resolve(
        bookmark.starBookmark(sessionId, url),
        res, 'Could not star/unstar bookmark.'
    );
};

//// ANNOTATIONS

exports.getAnnotation = function(req, res) {
    const sessionId = req.params.sessionId;
    const url = req.query.url;
    resolve(
        annotation.getAnnotations(sessionId, url),
        res, 'Could not get annotations.'
    );
};

exports.addAnnotation = function(req, res) {
    const sessionId = req.params.sessionId;
    const data = req.body;
    resolve(
        annotation.addAnnotation(sessionId, data),
        res, 'Could not create a new annotation.'
    );
};

exports.removeAnnotation = function(req, res) {
    const sessionId = req.params.sessionId;
    const url = req.body.url;
    const annotationId = req.body.annotationId;
    resolve(
        annotation.removeAnnotation(sessionId, url, annotationId),
        res, 'Could not delete annotation.'
    );
};