const puppeteer = require('puppeteer');
const request = require('request');
const config = require('../config/config');

const mongoose = require('mongoose');
const Page = mongoose.model('Page');

const refreshPeriod = 1000 * 60 * 60 * 24;


////


exports.processScrap = function(job, done) {
    const url = job.data.url;

    Page.findOne({'url': url}).exec()
        .then((doc) => {
            if (doc && doc.html) {
                const now = Math.floor(Date.now());
                const prev = Math.floor(doc.timestamp);
                if (now - prev < refreshPeriod) return done();
            }

            saveAll(url)
                .then((res) => console.log('Page scraped successfully : ' + url))
                .catch((err) => {
                    console.log('Headless Chrome failed. Using fallback method : ' + url);
                    console.log(err);
                    saveHtmlFallback(url);
                })
                .then(() => done());
        });
};

exports.processScreenshot = function(job, done) {
    const url = job.data.url;

    Page.findOne({'url': url}).exec()
        .then((doc) => {
            if (!doc) return done();
            
            const id = doc._id;
            const filepath = config.imageDir + '/' + id + '.png';

            saveScreenshot(url, filepath)
                .then((res) => console.log('Page screenshot saved successfully : ' + url))
                .then(() => done());
        });
};


////


const saveHtml = async function(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitFor(100);

    const body = await page.content();
    await upsertPage(url, {
        'url': url,
        'html': body,
        'timestamp': Math.floor(Date.now())
    });

    await browser.close();
};

const saveScreenshot = async function(url, filepath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'networkidle2',  timeout: 100000});
    await page.setViewport({width: 1360, height: 768});

    await page.screenshot({fullPage: true, path: filepath});
    await upsertPage(url, {
        'url': url,
        'screenshot': filepath,
        'timestamp': Math.floor(Date.now())
    });

    await browser.close();
};

const saveAll = async function(url) {
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

    console.log(id);

    const filepath = config.imageDir + '/' + id + '.png';
    await page.screenshot({fullPage: true, path: filepath});
    await upsertPage(url, {
        'screenshot': filepath
    });

    await browser.close();
};


////


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