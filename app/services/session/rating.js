'use strict';

const mongoose = require('mongoose');
const Rating = mongoose.model('Rating');

////

exports.getRating = async function(sessionId, url, userId) {
    const rating = await Rating.find({sessionId: sessionId, url: url});
    const total = rating.length == 0 ? 0 : rating.map(x => x.rating).reduce((x, y) => x + y);
    const own = rating.filter(x => x.userId === userId);

    console.log(total);
    console.log(own);

    return {
        rating: own.length == 0 ? 0 : own[0].rating,
        total: total,
    }
};

exports.submitRating = async function(sessionId, data) {
    let rating = await Rating.findOne({sessionId: sessionId, url: data.url, userId: data.userId});
    if (rating !== null) {
        rating.rating = data.rating;
        rating.save();
        return;
    }

    data.sessionId = sessionId;
    data.created = new Date();
    rating = new Rating(data);
    rating.save();
};