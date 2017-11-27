var queue = require('../config/initializers/kue');


////


exports.scrapDocuments = function(results) {
    results.forEach((result) => {
        storeDocumentScrap(result.url);
    });
};


////


var storeDocumentScrap = function(url) {
    var data = {
        title: "Scrap : " + url,
        url: url
    }

    queue.create('scrap_document', data)
        .attempts(3)
        .backoff({type: 'exponential'})
        .save();
}

var storeDocumentScreenshot = function(url) {
    var data = {
        title: "Screenshot : " + url,
        url: url
    }

    queue.create('scrap_screenshot', data)
        .attempts(3)
        .backoff({type: 'exponential'})
        .save();
}