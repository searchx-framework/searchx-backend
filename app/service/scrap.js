const queue = require('../config/initializers/kue');
const puppeteer = require('puppeteer');
const request = require('request');
const fs = require('fs');

const mongoose = require('mongoose');
const Page = mongoose.model('Page');

const config = require('../config/config');

////

exports.scrapPage = function(results) {
    results.forEach((result) => {
        pushScrapPage(result.url);
    });
};

const pushScrapPage = function(url) {
    const data = {
        title: "Scrap : " + url,
        url: url
    };

    queue.create('scrap_page', data)
        .attempts(3)
        .backoff({type: 'exponential'})
        .save();
};

////

exports.processScrapPage = async function(url) {
    const doc = await Page.findOne({'url': url});

    if (doc && doc.html) {
        const now = Math.floor(Date.now());
        const prev = Math.floor(doc.timestamp);

        if (now - prev < config.scrapFreshness) {
            return;
        }
    }

    try {
        await savePage(url);
    }
    catch(err) {
        saveHtmlFallback(url);
    }
};

////

const savePage = async function(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'networkidle2',  timeout: 100000});
    await page.setViewport({width: 1360, height: 768});

    const body = await page.content();
    const id = await upsertPage(url, {
        'url': url,
        'html': body,
        'timestamp': Math.floor(Date.now())
    });

    const dir = config.outDir + '/img/';
    const filepath = dir + id + '.png';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    await page.screenshot({fullPage: true, path: filepath});
    await upsertPage(url, {
        'screenshot': filepath
    });

    await browser.close();
};

const saveHtmlFallback = function(url) {
    request(url, function (error, response, body) {
        upsertPage(url, {
            'url': url,
            'html': body,
            'timestamp': Math.floor(Date.now())
        })
    });
};

////

const upsertPage = async function(url, doc) {
    const query = {'url': url};
    const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    };

    const res = await Page.findOneAndUpdate(query, doc, options).exec()
        .catch((err) => {
            console.log('Could not save page.');
            console.log(err);
        });

    return res._id;
};