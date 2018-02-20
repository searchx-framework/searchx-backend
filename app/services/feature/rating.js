'use strict';

const mongoose = require('mongoose');
const Rating = mongoose.model('Rating');

////

exports.getRating = async function(sessionId, url, userId) {
    const ratings = await Rating.find({sessionId: sessionId, url: url});
    const total = ratings.length == 0 ? 0 : ratings.map(x => x.rating).reduce((x, y) => x + y);

    let rating = 0;
    if (userId !== null) {
        const own = ratings.filter(x => x.userId === userId);
        rating = own.length == 0 ? 0 : own[0].rating;
    }

    return {
        rating: rating,
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