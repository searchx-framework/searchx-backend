'use strict';

var config = require('../config/config');
var cache = require('./cache');
var rating = require('./rating');
var scrap = require('./scrap');

console.log(config.bingAccessKey);

var request  = require('request');
var Bing     = require('node-bing-api')({accKey: config.bingAccessKey});
var async    = require('async');

exports.searchWeb = function(req, res) {
    var searchQuery = req.query.query || '';
    var userId = req.query.userId || '';

    cache.getSearchResultsFromCache(searchQuery, 'web', parseInt(req.query.page), function(status, response) {
        if (status) {
            addMetadata(response.results, userId, function(results) {
                var result = {
                    'results': results,
                    'matches': response.matches,
                    'id': response.id
                };
                
                scrap.scrapDocuments(result.results);
                res.status(200).json(result);
            });
        } else {
            Bing.web(searchQuery, constructOptions(req.query, 'web'), function(error, response, body) {
                if (body && body.webPages) {
                    var date = new Date();
                    var id = searchQuery + '_' + req.query.page + '_web_' + date.getTime();
                    var result = {
                        results: body.webPages.value,
                        matches: body.webPages.totalEstimatedMatches,
                        id: id
                    };

                    cache.addSearchResultsToCache(searchQuery, 'web', parseInt(req.query.page), date, result, body);
                    addMetadata(body.webPages.value, userId, function(results) {
                        result.results = results;
                        scrap.scrapDocuments(result.results);
                        res.status(200).json(result);
                    });
                } else {
                    console.log(body);
                    res.status(503).json({
                        error: true,
                        message: 'The request resulted in a backend time out or backend error. The team is investigating the issue. We are sorry for the inconvenience.'
                    });
                }
            });
        }
    });
};

exports.searchNews = function(req, res) {
    var searchQuery = req.query.query || '';

    Bing.news(searchQuery, constructOptions(req.query, 'news'), function(error, response, body) {
        if (body && body.value) {
            var date = new Date();
            var id = searchQuery + '_' + req.query.page + '_news_' + date.getTime();
            var result  = {
                'results': body.value,
                'matches': body.totalEstimatedMatches,
                'id': id

            };
            cache.addSearchResultsToCache(searchQuery, 'news', parseInt(req.query.page), date, result, body);
            res.status(200).json(result);
        } else {
            res.status(503).json({
                error: true,
                message: 'The request resulted in a backend time out or backend error. The team is investigating the issue. We are sorry for the inconvenience.'
            });
        }
    });
};

exports.searchImages = function(req, res) {
    var searchQuery = req.query.query || '';

    cache.getSearchResultsFromCache(searchQuery, 'images', parseInt(req.query.page), function(status, response) {
        if (status) {
            res.status(200).json(response);
        } else {
            Bing.images(searchQuery, constructOptions(req.query, 'images'), function(error, response, body) {
                if (body && body.value) {
                    var date = new Date();
                    var id = searchQuery + '_' + req.query.page + '_news_' + date.getTime();
                    var result  = {
                        'results': body.value,
                        'matches': body.totalEstimatedMatches,
                        'id': id
                    };
                    cache.addSearchResultsToCache(searchQuery, 'images', parseInt(req.query.page), date, result, body);
                    res.status(200).json(result);
                } else {
                    res.status(503).json({
                        error: true,
                        message: 'The request resulted in a backend time out or backend error. The team is investigating the issue. We are sorry for the inconvenience.'
                    });
                }
            });
        }
    });
};

exports.searchVideos = function(req, res) {
    var searchQuery = req.query.query || '';

    cache.getSearchResultsFromCache(searchQuery, 'videos', parseInt(req.query.page), function(status, response) {
        if (status) {
            res.status(200).json(response);
        } else {
            Bing.video(searchQuery, constructOptions(req.query, 'videos'), function(error, response, body) {
                if (body && body.value) {
                    var date = new Date();
                    var id = searchQuery + '_' + req.query.page + '_news_' + date.getTime();
                    var result  = {
                        'results': body.value,
                        'matches': body.totalEstimatedMatches,
                        'id': id
                    };
                    cache.addSearchResultsToCache(searchQuery, 'videos',  parseInt(req.query.page), date, result, body);
                    res.status(200).json(result);
                } else {
                    res.status(503).json({
                        error: true,
                        message: 'The request resulted in a backend time out or backend error. The team is investigating the issue. We are sorry for the inconvenience.'
                    });
                }
            });
        }
    });
};

/*
 * Add metadata from search results
 *
 * @params
 */
var addMetadata = function(results, userId, callback) {
    // This is your async worker function
    // It takes the item first and the callback second
    function fillWithRating(result, callback) {
        rating.getRating('web', result.displayUrl, function(data) {
            result.rating = data;
            callback(null, result);
        });
    }

    function fillWithRatingSignal(result, callback) {
        rating.userHasRated('web', result.displayUrl, userId, function(data) {
            result.signal = data;
            callback(null, result);
        });
    }

    // The done function must take an error first
    // and the results array second
    function thenWithRatingSignal(error, results) {
        async.map(results, fillWithRatingSignal, done);
    }

    function done(error, results) {
        callback(results);
    }

    async.map(results, fillWithRating, thenWithRatingSignal);
};

/*
 * Construct Bing search query options
 *
 * https://www.npmjs.com/package/node-bing-api
 * https://docs.microsoft.com/en-us/azure/cognitive-services/bing-web-search/search-the-web
 *
 * @params The query parameters passed to the API via GET
 */
var constructOptions = function(params, vertical) {
    var count = vertical === 'images' || vertical === 'videos' ? 12: 10;
    // System defined
    var mkt = 'en-US';
    var offset = (params.page-1)*count;
    return {
        offset: offset,
        count: count,
        mkt: mkt
    };
};