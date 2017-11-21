'use strict';

var mongoose = require('mongoose');
var Cache    = mongoose.model('Cache');
var config   = require('../config/config');

//FIX: move out to a utility file at some point
function isAString(s) {
    if (typeof s == 'undefined' || s == null || typeof s != 'string') {
        return false;
    }
    return true;
}

function isPosInteger(i) {
    if ( i == null || typeof i != 'number' || i<0) {
        return false;
    }
    return true;
}

function isObject(o) {
    if (typeof o == 'undefined' || o == null || typeof o != 'object') {
        return false;
    }
    return true;
}


////


exports.addSearchResultsToCache = function(query, vertical, page, courseId, date, results, body){
    //we need all arguments
    if (arguments.length != 7) {
        console.log('Could not create a new cache - Arguments.');
        return false;
    }

    if (!isAString(query) || !isAString(vertical) || !isPosInteger(page) || !isObject(date) || !isObject(results) || !isObject(body)) {
        console.log('Could not create a new cache - types.');
        return false;
    }

    var C = new Cache({
            date: date,
            query: query,
            vertical: vertical,
            page:  page,
            results: results,
            body: body
    });
    C.save(function(error) {
        if (error) {
            console.log('Could not create a new cache.');
            console.log(error);
            return false;
        }
    });
    return true;
}

exports.getSearchResultsFromCache = function(query, vertical, page, courseId, callback){
    
    if (arguments.length < 5) {
        throw new Error('Missing required arguments.'); 
    }

    if ((typeof query == 'undefined') || (query == null) || (typeof query != 'string')){
        callback(false,{});
    }

    if ((typeof vertical == 'undefined') || (vertical == null)  || (typeof vertical != 'string') ){
        callback(false,{});
        return;
    }

    if ((typeof page == 'undefined') || (page == null) || (page < 0) || (typeof page != 'number')){
        callback(false,{});
        return;
    }

    if ((typeof callback == 'undefined') || (callback == null) || (callback < 0) || (typeof callback != 'function')){
       throw new Error('Callback is not a function.'); 
    }
  
    Cache.find({query: query, vertical: vertical, page: parseInt(page), courseId: courseId})
        .sort({date:'descending'}).limit(1).exec(function(error, data) {
            
            if (!error) {
                if (data.length == 0) { 
                    callback(false,{});
                } else if ( isFresh(data[0].date)) {
                    callback(true,data[0].results);
                } else {
                     callback(false,{});
                }      
            } else {
                callback(false,{});  
            }    
        });
}

var isFresh = function(date){
    var currentDate = new Date;
    if ((currentDate-date)/1000  > config.cacheFreshness) {
        return false;
    } 
    return true;
}