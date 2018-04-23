'use strict';

const mongoose = require('mongoose');
const ViewedResults = mongoose.model('ViewedResults');
const Utils = require('../../utils');
const _  = require('underscore');

////

exports.addViewedResultIds = async function(query, vertical, provider, sessionId, userId, resultIds){
    if (arguments.length < 6) {
        throw {
            name: 'Bad Request',
            message: 'Missing required arguments.'
        };
    }

    if (!Utils.isAString(query) || !Utils.isAString(vertical) || !Utils.isAString(provider) || !Utils.isAString(sessionId) || !Utils.isAString(userId) || !Array.isArray(resultIds)) {
        throw {
            name: 'Bad Request',
            message: 'Invalid arguments.'
        };
    }

    const viewedResults = await ViewedResults.findOne({
        query: query,
        vertical: vertical,
        provider: provider,
        sessionId: sessionId,
        userId: userId
    });

    if (viewedResults) {
        viewedResults.resultIds = _.union(viewedResults.resultIds, resultIds);
        viewedResults.save();
    } else {
        const V = new ViewedResults({
            query: query,
            vertical: vertical,
            provider: provider,
            sessionId: sessionId,
            userId: userId,
            resultIds: resultIds
        });
        V.save();
    }
};

exports.getViewedResultIds = async function(query, vertical, provider, sessionId, userId){
    if (arguments.length < 5) {
        throw {
            name: 'Bad Request',
            message: 'Missing required arguments.'
        };
    }

    if (!Utils.isAString(query) || !Utils.isAString(vertical) || !Utils.isAString(provider) || !Utils.isAString(sessionId) || !Utils.isAString(userId)){
        throw {
            name: 'Bad Request',
            message: 'Invalid arguments.'
        };
    }

    ////
  
    const viewedResults = await ViewedResults
        .findOne({query: query, vertical: vertical, provider: provider, sessionId: sessionId, userId: userId});

    if (viewedResults) {
        return viewedResults.resultIds;
    } else {
        return [];
    }
};