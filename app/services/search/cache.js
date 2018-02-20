'use strict';

const mongoose = require('mongoose');
const Cache = mongoose.model('Cache');
const Utils = require('../../utils');

////

exports.addSearchResultsToCache = async function(query, vertical, page, date, data){
    if (arguments.length !== 5) {
        console.log('Could not create a new cache - Arguments.');
        throw {
            name: 'Bad Request',
            message: 'Missing required arguments.'
        };
    }

    if (!Utils.isAString(query) || !Utils.isAString(vertical) || !Utils.isPosInteger(page) || !Utils.isObject(date) || !Utils.isObject(data)) {
        console.log('Could not create a new cache - types.');
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
            data: data
    });

    await C.save();
};

exports.getSearchResultsFromCache = async function(query, vertical, pageNumber){
    if (arguments.length < 3) {
        throw {
            name: 'Bad Request',
            message: 'Missing required arguments.'
        };
    }

    if (!Utils.isAString(query) || !Utils.isAString(vertical) || !Utils.isPosInteger(pageNumber)){
        throw {
            name: 'Bad Request',
            message: 'Invalid arguments.'
        };
    }

    ////
  
    const data = await Cache
        .find({query: query, vertical: vertical, page: parseInt(pageNumber)})
        .sort({date:'descending'})
        .limit(1);

    if (data.length === 0 || !Utils.isFresh(data[0].date)) {
        return false;
    }

    return data[0];
};