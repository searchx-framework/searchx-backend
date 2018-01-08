'use strict';

const config = require('../config/config');
const cache = require('./cache');
const bookmark = require('./bookmark');
const scrap = require('./scrap');

const Bing     = require('node-bing-api')({accKey: config.bingAccessKey, rootUri: "https://api.cognitive.microsoft.com/bing/v7.0/"});
const async    = require('async');

exports.searchWeb = function(req, res) {
    const searchQuery = req.query.query || '';
    const sessionId = req.query.sessionId || '';

    cache.getSearchResultsFromCache(searchQuery, 'web', parseInt(req.query.page), function(status, response) {
        if (status) {
            addMetadata(response.results, sessionId, function(err, results) {
                const result = {
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
                    const date = new Date();
                    const id = searchQuery + '_' + req.query.page + '_web_' + date.getTime();
                    const result = {
                        results: body.webPages.value,
                        matches: body.webPages.totalEstimatedMatches,
                        id: id
                    };

                    cache.addSearchResultsToCache(searchQuery, 'web', parseInt(req.query.page), date, result, body);
                    addMetadata(body.webPages.value, sessionId, function(err, results) {
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
    const searchQuery = req.query.query || '';
    const sessionId = req.query.sessionId || '';
    Bing.news(searchQuery, constructOptions(req.query, 'news'), function(error, response, body) {


        if (body && body.value) {
            const date = new Date();
            const id = searchQuery + '_' + req.query.page + '_news_' + date.getTime();
            const result  = {
                'results': body.value,
                'matches': body.totalEstimatedMatches,
                'id': id

            };
            cache.addSearchResultsToCache(searchQuery, 'news', parseInt(req.query.page), date, result, body);
            addMetadata(body.value, sessionId, function(err, results) {
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
    const searchQuery = req.query.query || '';
    const sessionId = req.query.sessionId || '';

    cache.getSearchResultsFromCache(searchQuery, 'images', parseInt(req.query.page), function(status, response) {
        if (status) {

            addMetadata(response.results, sessionId, function(err, results) {
                const result = {
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
                    const date = new Date();
                    const id = searchQuery + '_' + req.query.page + '_news_' + date.getTime();
                    const result  = {
                        'results': body.value,
                        'matches': body.totalEstimatedMatches,
                        'id': id
                    };

                    for (let i = 0; i < body.value.length; i++) {
                        body.value[i].url = body.value[i].contentUrl;
                    }

                    cache.addSearchResultsToCache(searchQuery, 'images', parseInt(req.query.page), date, result, body);

                    addMetadata(body.value, sessionId, function(err, results) {
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
    const searchQuery = req.query.query || '';
    const sessionId = req.query.sessionId || '';
    cache.getSearchResultsFromCache(searchQuery, 'videos', parseInt(req.query.page), function(status, response) {
        if (status) {

            addMetadata(response.results, sessionId, function(err, results) {
                const result = {
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
                    const date = new Date();
                    const id = searchQuery + '_' + req.query.page + '_videos_' + date.getTime();
                    const result  = {
                        'results': body.value,
                        'matches': body.totalEstimatedMatches,
                        'id': id
                    };
                    
                    
                    for (let i = 0; i < body.value.length; i++) {
                        body.value[i].url = body.value[i].contentUrl;
                    }
                    cache.addSearchResultsToCache(searchQuery, 'videos',  parseInt(req.query.page), date, result, body);

                    addMetadata(body.value, sessionId, function(err, results) {
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
const addMetadata = function(results, sessionId, finish) {
    // This is your async worker function
    // It takes the item first and the callback second
    
    function fillWithBookmark(result, callback) {
        bookmark.isBookmarked(sessionId, result.url, function(data) {
            result.bookmark = false;

            if (data.userId) {
                result.bookmark = true;
                result.bookmarkUserId = data.userId;
                result.bookmarkTime = data.date;
            }

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
const constructOptions = function(params, vertical) {
    const count = vertical === 'images' || vertical === 'videos' ? 12: 10;
    // System defined
    const mkt = 'en-US';
    const offset = (params.page-1)*count;

    return {
        offset: offset,
        count: count,
        mkt: mkt
    };
};