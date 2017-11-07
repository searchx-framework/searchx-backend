'use strict';

//var mongoose = require('mongoose');
//var Folder   = mongoose.model('Folder');
//var Bookmark = mongoose.model('Bookmark');

var contentScraper = {};
contentScraper.process = function(job, done) {
    console.log('Processing job: deindex_bookmark');
    console.log(job.data);

    done();
};

module.exports = contentScraper;