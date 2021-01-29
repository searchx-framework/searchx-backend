'use strict';

const mongoose = require('mongoose');
const SearchState = mongoose.model('SearchState');

////

exports.getSearchState= async function(sessionId) {
    return await SearchState
        .findOne({sessionId: sessionId})
        .sort({created: -1});
};

exports.pushSearchState = async function(sessionId, userId, state) {
    const data = {
        sessionId: sessionId,
        userId: userId,
        state: JSON.stringify(state)
    };

    data.created = new Date();

    const S = new SearchState(data);
    S.save();
};
