'use strict';

const mongoose = require('mongoose');
const Bookmark = mongoose.model('Bookmark');

////

exports.addBookmark = async function(sessionId, data) {
    data.sessionId = sessionId;
    const doc = await Bookmark.findOne({
        url: data.url,
        sessionId: data.sessionId
    });

    if (!doc) {
        const now = new Date();
        data.created = now;
        data.date = now;

        const B = new Bookmark(data);
        B.save();
        return;
    }

    if (doc.deleted === true) {
        doc.userId = data.userId;
        doc.deleted = false;
        doc.date = new Date();
        doc.save();
    }
};

exports.removeBookmark = async function(sessionId, url) {
    const doc = await Bookmark.findOne({
        url: url,
        sessionId: sessionId
    });

    if (!doc) {
        throw new Error('Bookmark does not exist');
    }

    doc.starred = false;
    doc.deleted = true;
    doc.save();
};

exports.starBookmark = async function(sessionId, url) {
    const doc = await Bookmark.findOne({
        url: url,
        sessionId: sessionId
    });

    if (!doc) {
        throw new Error('Bookmark does not exist');
    }

    doc.starred = !doc.starred;
    doc.save();
};

////

exports.getBookmarks = async function(sessionId) {
    return await Bookmark
        .find(
            {sessionId: sessionId, deleted: false},
            {url:1, title: 1, date: 1, userId: 1, starred: 1, _id: 0}
        )
        .sort({date: 1});
};

exports.getBookmark = async function(sessionId, url) {
    const query = {
        sessionId: sessionId,
        url: url,
        deleted: false
    };

    const docs = await Bookmark.find(query, {date: 1, userId: 1, starred: 1, _id: 0});
    if (docs.length !== 0) {
        return docs[0];
    }

    return null;
};