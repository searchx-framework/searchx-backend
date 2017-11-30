var queue = require('../config/initializers/kue');


////


exports.scrapPages = function(results) {
    results.forEach((result) => {
        storePageScrap(result.url);
    });
};


////


var storePageScrap = function(url) {
    var data = {
        title: "Scrap : " + url,
        url: url
    }

    queue.create('scrap_page', data)
        .attempts(3)
        .backoff({type: 'exponential'})
        .save();
}

var storePageScreenshot = function(url) {
    var data = {
        title: "Screenshot : " + url,
        url: url
    }

    queue.create('scrap_screenshot', data)
        .attempts(3)
        .backoff({type: 'exponential'})
        .save();
}