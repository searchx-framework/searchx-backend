'use strict';

const mongoose  = require('mongoose');
const Bookmark  = mongoose.model('Bookmark');
const User      = mongoose.model('User');

////

exports.addBookmark = function(req, res) {
    const data = req.body;
    const query = {
        url: data.url,
        sessionId: data.sessionId
    };
    
    Bookmark.findOne(query, function(err, doc) {
        if (!err) {
            if (!doc) {
                const now = new Date();

                data.deleted = false;
                data.created = now;
                data.date = now;

                const B = new Bookmark(data);
                B.save(function(error) {
                    if (error) {
                        res.status(401).json({
                            error: true,
                            message: 'Could not create a new bookmark.'
                        });
                    } else {
                        res.status(201).json({error: false});
                    }
                });

            }  else {
                    if (doc.deleted === true) {
                        doc.userId = data.userId;
                        doc.deleted = false;
                        doc.date = new Date();
                        doc.save();
                    }
                    res.status(201).json({error: false});
            }
         } else {
            res.status(401).json({
                error: true,
                message: 'Could not create a new bookmark.'
            });
        }
    });
};

exports.removeBookmark = function(req,res) {
    const data = req.body;
    if (data.sessionId === null) {
        res.status(401).json({
            error: true,
            message: 'Could not delete bookmark.'
        });
    }

    ////

    const query = {
        url: data.url,
        sessionId: data.sessionId
    };

    Bookmark.findOne(query, function(err, doc) {
        if (err) {
            res.status(401).json({
                error: true,
                message: 'Could not delete bookmark.'
            });

        } else {
            if (doc) {
                doc.deleted = true;
                doc.save((err) => {
                    if(err) {
                        console.log(err);
                    }
                });
                res.status(201).json({error: false});
            } else {
                res.status(401).json({
                    error: true,
                    message: 'Could not delete bookmark.'
                });
            }
        }
    });
};

////

exports.getBookmarks = function(req, res) {
    const sessionId = req.params.sessionId;
    Bookmark.find(
            {sessionId: sessionId, deleted: false },
            {url:1, title: 1, date: 1, userId: 1, _id: 0}
        )
        .sort({date: 1})
        .exec(function(error, data) {
            if (!error) {
                res.status(201).json({error: false, results: data });
            } else {
                res.status(401).json({
                    error: true,
                    message: 'Could not get bookmarks.'
                });
            }
        });    
};

exports.isBookmarked = function(sessionId, url, callback) {
    const query = {
        sessionId: sessionId,
        url: url,
        deleted: false
    };

    Bookmark.find(query).exec(function(error, data) {
        if (!error) {
            if (data.length === 0) {
                callback({});
            } else {
                const bookmark = data[0];
                callback({
                    userId: bookmark.userId,
                    date: bookmark.date
                });
            }     
        } else {
            callback({});
        }    
    });
 };

