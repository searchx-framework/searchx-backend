'use strict';

const bookmark = require('../../../services/session/bookmark');
const queryhistory = require('../../../services/session/queryhistory');

////

exports.addBookmark = function(req, res) {
    const data = req.body;
    const sessionId = req.params.sessionId;

    bookmark.addBookmark(sessionId, data)
        .then(() => {
            res.status(201).json({
                error: false
            });
        })
        .catch((err) => {
            console.log(err);

            res.status(401).json({
                error: true,
                message: 'Could not create a new bookmark.'
            });
        });
};

exports.removeBookmark = function(req,res) {
    const url = req.body.url;
    const sessionId = req.params.sessionId;

    bookmark.removeBookmark(sessionId, url)
        .then(() => {
            res.status(201).json({
                error: false
            });
        })
        .catch((err) => {
            console.log(err);

            res.status(401).json({
                error: true,
                message: 'Could not delete bookmark.'
            });
        });
};

exports.starBookmark = function(req, res) {
    const url = req.body.url;
    const sessionId = req.params.sessionId;

    bookmark.starBookmark(sessionId, url)
        .then(() => {
            res.status(201).json({
                error: false
            });
        })
        .catch((err) => {
            console.log(err);

            res.status(401).json({
                error: true,
                message: 'Could not star/unstar bookmark.'
            });
        });
};

////

exports.getBookmarks = function(req, res) {
    const sessionId = req.params.sessionId;

    bookmark.getBookmarks(sessionId)
        .then((docs) => {
            res.status(201).json({
                error: false,
                results: docs
            });
        })
        .catch((err) => {
            console.log(err);

            res.status(401).json({
                error: true,
                message: 'Could not get bookmarks.'
            });
        });
};

exports.getQueryHistory = function(req, res) {
    const sessionId = req.params.sessionId;

    queryhistory.getQueryHistory(sessionId)
        .then((docs) => {
            res.status(201).json({
                error: false,
                results: docs
            });
        })
        .catch((err) => {
            console.log(err);

            res.status(401).json({
                error: true,
                message: 'Could not get query history.'
            });
        });
};
