'use strict';

var config = require('../config/config');
var cache = require('./cache');
var bookmark = require('./bookmark');
var scrap = require('./scrap');

var request  = require('request');
var Bing     = require('node-bing-api')({accKey: config.bingAccessKey, rootUri: "https://api.cognitive.microsoft.com/bing/v7.0/"});
var async    = require('async');

exports.searchWeb = function(req, res) {
    var searchQuery = req.query.query || '';
    var userId = req.query.userId || '';

    cache.getSearchResultsFromCache(searchQuery, 'web', parseInt(req.query.page), function(status, response) {
        if (status) {
            addMetadata(response.results, userId, function(err, results) {
                var result = {
                    'results': results,
                    'matches': response.matches,
                    'id': response.id
                };
                
                scrap.scrapPages(result.results);
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
                    addMetadata(body.webPages.value, userId, function(err, results) {
                        result.results = results;
                        scrap.scrapPages(result.results);
                        res.status(200).json(result);
                    });
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

exports.searchNews = function(req, res) {
    var searchQuery = req.query.query || '';
    var userId = req.query.userId || '';
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
            addMetadata(body.value, userId, function(err, results) {
                result.results = results;
                scrap.scrapPages(result.results);
                res.status(200).json(result);
            });
            
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
    var userId = req.query.userId || '';

    cache.getSearchResultsFromCache(searchQuery, 'images', parseInt(req.query.page), function(status, response) {
        if (status) {

            addMetadata(response.results, userId, function(err, results) {
                var result = {
                    'results': results,
                    'matches': response.matches,
                    'id': response.id
                };
                
                scrap.scrapPages(result.results);
                res.status(200).json(result);
            });


            
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

                    for (let i = 0; i < body.value.length; i++) {
                        body.value[i].url = body.value[i].contentUrl;
                    }

                    cache.addSearchResultsToCache(searchQuery, 'images', parseInt(req.query.page), date, result, body);

                    addMetadata(body.value, userId, function(err, results) {
                        result.results = results;
                        scrap.scrapPages(result.results);
                        res.status(200).json(result);
                    });
                } else {
                    console.log(error);
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
    var userId = req.query.userId || '';
    cache.getSearchResultsFromCache(searchQuery, 'videos', parseInt(req.query.page), function(status, response) {
        if (status) {

            addMetadata(response.results, userId, function(err, results) {
                var result = {
                    'results': results,
                    'matches': response.matches,
                    'id': response.id
                };
                
                scrap.scrapPages(result.results);
                res.status(200).json(result);
            });

        } else {
            Bing.video(searchQuery, constructOptions(req.query, 'videos'), function(error, response, body) {
                if (body && body.value) {
                    var date = new Date();
                    var id = searchQuery + '_' + req.query.page + '_videos_' + date.getTime();
                    var result  = {
                        'results': body.value,
                        'matches': body.totalEstimatedMatches,
                        'id': id
                    };
                    
                    
                    for (let i = 0; i < body.value.length; i++) {
                        body.value[i].url = body.value[i].contentUrl;
                    }
                    cache.addSearchResultsToCache(searchQuery, 'videos',  parseInt(req.query.page), date, result, body);

                    addMetadata(body.value, userId, function(err, results) {
                        result.results = results;
                        scrap.scrapPages(result.results);
                        res.status(200).json(result);
                    });
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
var addMetadata = function(results, userId, finish) {
    // This is your async worker function
    // It takes the item first and the callback second
    
    function fillWithBookmark(result, callback) {
        
        bookmark.isBookmarked(userId, result.url, function(data) {
            result.bookmark = data;
            callback(null, result);
        });
    }


    async.map(results, fillWithBookmark, finish);
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