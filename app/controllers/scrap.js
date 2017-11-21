var queue = require('../config/initializers/kue');


////


exports.screenshotDocument = function(req, res) {
    var url = req.url || '';
    storeDocumentScreenshot(url);
}

exports.scrapDocumentHtmls = function(results) {
    results.forEach((result) => {
        storeDocumentHtml(result.url);
    });
};


////


var storeDocumentHtml = function(url) {
    var data = {
        title: "Scrap HTML : " + url,
        url: url
    }

    queue.create('scrap_html', data)
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