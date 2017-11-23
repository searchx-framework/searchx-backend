var puppeteer = require('puppeteer');
var request = require('request');
var mongoose = require('mongoose');
var Document = require('../models/document');
var config = require('../config/config');

var refreshPeriod = 1000 * 60 * 60 * 24;


////


exports.processScrap = function(job, done) {
    var url = job.data.url;

    Document.findOne({'url': url}).exec()
        .then((doc) => {
            if (doc && doc.html) {
                var now = Math.floor(Date.now());
                var prev = Math.floor(doc.timestamp);
                if (now - prev < refreshPeriod) return done();
            }

            saveAll(url)
                .then((result) => console.log('Document scraped successfully : ' + url))
                .catch((err) => {
                    console.log('Headless Chrome failed. Using fallback method : ' + url);
                    console.log(err);
                    saveHtmlFallback(url);
                })
                .then(() => done());
        });
};

exports.processScreenshot = function(job, done) {
    var url = job.data.url;

    Document.findOne({'url': url}).exec()
        .then((doc) => {
            if (!doc) return done();
            
            var id = doc._id;
            var filepath = config.imageDir + '/' + id + '.png';

            saveScreenshot(url, filepath)
                .then((result) => console.log('Document screenshot saved successfully : ' + url))
                .then(() => done());
        });
};


////


var saveHtml = async function(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitFor(100);

    const body = await page.content();
    await upsertDocument(url, {
        'url': url,
        'html': body,
        'timestamp': Math.floor(Date.now())
    });

    await browser.close();
};

var saveScreenshot = async function(url, filepath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'networkidle2',  timeout: 100000});
    await page.setViewport({width: 1360, height: 768});

    await page.screenshot({fullPage: true, path: filepath});
    await upsertDocument(url, {
        'url': url,
        'screenshot': filepath,
        'timestamp': Math.floor(Date.now())
    });

    await browser.close();
};

var saveAll = async function(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'networkidle2',  timeout: 100000});
    await page.setViewport({width: 1360, height: 768});

    const body = await page.content();
    const id = await upsertDocument(url, {
        'url': url,
        'html': body,
        'timestamp': Math.floor(Date.now())
    });

    console.log(id);

    const filepath = config.imageDir + '/' + id + '.png';
    await page.screenshot({fullPage: true, path: filepath});
    await upsertDocument(url, {
        'screenshot': filepath
    });

    await browser.close();
};


////


var saveHtmlFallback = function(url) {
    request(url, function (error, response, body) {
        upsertDocument(url, {
            'url': url,
            'html': body,
            'timestamp': Math.floor(Date.now())
        })
    });
}


////


var upsertDocument = async function(url, doc) {
    const query = {'url': url};
    const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    }

    const res = await Document.findOneAndUpdate(query, doc, options).exec()
        .catch((err) => {
            console.log('Could not save document.');
            console.log(err);
        });

    return res._id;
}