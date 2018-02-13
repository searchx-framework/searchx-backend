'use strict';

const queryhistory = require('../../../services/session/queryhistory');
const bookmark = require('../../../services/session/bookmark');

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

////

exports.getQueryHistory = function(req, res) {
    const sessionId = req.params.sessionId;
    resolve(
        queryhistory.getQueryHistory(sessionId),
        res, 'Could not get query history.'
    );
};

////

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
