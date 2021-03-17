'use strict';

const mongoose = require('mongoose');
const Basket = mongoose.model('Basket');

////

exports.addBasketItem = async function(sessionId, data) {

    data.sessionId = sessionId;
    const doc = await Basket.findOne({
        url: data.url,
        sessionId: data.sessionId
    });

    if (!doc) {
        const now = new Date();
        data.created = now;
        data.date = now;

        const B = new Basket(data);
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

exports.removeBasketItem = async function(sessionId, url) {

    const doc = await Basket.findOne({
        url: url,
        sessionId: sessionId
    });

    if (!doc) {
        throw new Error('Basket item does not exist');
    }

    doc.deleted = true;
    doc.save();
};


exports.getBasketItems = async function(sessionId) {

    return await Basket
        .find(
            {sessionId: sessionId, deleted: false},
            {url:1, title: 1, date: 1, userId: 1, _id: 0}
        )
        .sort({date: 1});
};

exports.getUserBasketItems = async function(sessionId, userId) {
    return await Basket
        .find(
            {sessionId: sessionId, userId: userId, deleted: false},
            {url:1, title: 1, date: 1, userId: 1, _id: 0}
        )
        .sort({date: 1});
};

exports.getBasketItem = async function(sessionId, url) {
    const query = {
        sessionId: sessionId,
        url: url,
        deleted: false
    };

    const docs = await Basket.find(query, {date: 1, userId: 1, starred: 1, _id: 0});
    if (docs.length !== 0) {
        return docs[0];
    }

    return null;
};