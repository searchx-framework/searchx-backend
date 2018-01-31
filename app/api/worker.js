'use strict';

const Scrap = require('../services/scrap');

////

exports.processScrapPage = function(job, done) {
    const url = job.data.url;
    Scrap.processScrapPage(url)
        .then(() => done())
        .catch((err) => {
            console.log(err);
            done(new Error('Error in scrapping page for url "' + url + '".'));
        })
};
