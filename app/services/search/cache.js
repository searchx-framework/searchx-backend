'use strict';

const mongoose = require('mongoose');
const Cache = mongoose.model('Cache');
const Utils = require('../../utils');

////

exports.addSearchResultsToCache = async function(query, vertical, page, date, data, provider){
    if (arguments.length !== 6) {
        throw {
            name: 'Bad Request',
            message: 'Missing required arguments.'
        };
    }

    if (!Utils.isAString(query) || !Utils.isAString(vertical) || !Utils.isPosInteger(page) || !Utils.isObject(date) || !Utils.isObject(data) || !Utils.isAString(provider)) {
        throw {
            name: 'Bad Request',
            message: 'Invalid arguments.'
        };
    }

    const C = new Cache({
            date: date,
            query: query,
            vertical: vertical,
            page:  page,
            data: data,
            provider: provider
    });

    await C.save();
};

exports.getSearchResultsFromCache = async function(query, vertical, pageNumber, provider){
    if (arguments.length < 4) {
        throw {
            name: 'Bad Request',
            message: 'Missing required arguments.'
        };
    }

    if (!Utils.isAString(query) || !Utils.isAString(vertical) || !Utils.isPosInteger(pageNumber) || !Utils.isAString(provider)){
        throw {
            name: 'Bad Request',
            message: 'Invalid arguments.'
        };
    }

    ////
  
    const data = await Cache
        .find({query: query, vertical: vertical, page: parseInt(pageNumber), provider: provider})
        .sort({date:'descending'})
        .limit(1);

    if (data.length === 0 || !Utils.isFresh(data[0].date)) {
        return false;
    }

    return data[0];
};