'use strict';

// var config = require('../config/config');
// require('../config/initializers/mongoose')(config.db);

// var mongoose = require('mongoose');
// var Folder   = mongoose.model('Folder');
// var Bookmark = mongoose.model('Bookmark');
// var when     = require('when');
// var request  = require('request');

// var bookmarkIndexer = {};
// bookmarkIndexer.process = function(job, done) {
//     console.log('Processing job: index_bookmark');

//     var elasticSearchDocument = {
//         _id: job.data._id,
//         folder: '',
//         user: '',
//         public: true,
//         title: '',
//         url: '',
//         description: '',
//         text: '',
//         entities: '',
//         keywords: ''
//     };

//     Bookmark
//         .findOne({_id: elasticSearchDocument._id})
//         .then(function(bookmark) {
//             elasticSearchDocument.title = bookmark.title;
//             elasticSearchDocument.url = bookmark.url;
//             elasticSearchDocument.description = bookmark.description;
//             return Folder.findOne({_id: bookmark.folder.toString()})
//         })
//         .then(function(folder) {
//             elasticSearchDocument.folder = folder.name;
//             elasticSearchDocument.user = folder.user;
//             elasticSearchDocument.public = folder.public;
//             return request.post({
//                 uri: config.elasticsearch + '/index/bookmarks/' + elasticSearchDocument._id,
//                 method: 'POST',
//                 json: elasticSearchDocument
//             });
//         })
//         .then(function(result) {
//             done();
//         });
// };

// module.exports = bookmarkIndexer;