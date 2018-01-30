const queue = require('../config/initializers/kue');
const puppeteer = require('puppeteer');
const request = require('request');

const fs = require('fs');
const http = require('http');
const https = require('https');

const mongoose = require('mongoose');
const Page = mongoose.model('Page');

const config = require('../config/config');
if (!fs.existsSync(config.outDir)) {
    fs.mkdirSync(config.outDir);
}

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
        if(isFile(url)) {
            await saveFile(url);
        } else {
            await savePage(url);
        }
    }
    catch(err) {
        saveHtmlFallback(url);
    }
};

////

const getExtension = function(url) {
    return url
        .split('?')[0]
        .split('/').pop()
        .split('.').pop();
};

const isFile = function(url) {
    let extension = getExtension(url);
    if(extension === undefined) return false;

    extension = extension.toLowerCase();
    return extension === 'pdf' || extension === 'jpg' || extension === 'png';
};

const saveFile = async function(url) {
    const id = await upsertPage(url, {
        'url': url,
        'timestamp': Math.floor(Date.now())
    });

    ////

    const extension = getExtension(url);
    const dir = config.outDir + '/files/';
    const path = dir + id + '.' + extension;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    const protocol = url.split(':')[0];
    const stream  = fs.createWriteStream(path);

    if (protocol === 'https') {
        https.get(url, (res) => res.pipe(stream))
            .on('error', (err) => console.log(err));
    } else {
        http.get(url, (res) => res.pipe(stream))
            .on('error', (err) => console.log(err));
    }

    ////

    upsertPage(url, {
        'file': path
    });
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

let browser = null;
let browserStarting = false;

const waitForNewPage = async function() {
    while (browserStarting) {
        await sleep(1000);
        if (!browserStarting) {
            break;
        }
    }

    if (browser === null) {
        browserStarting = true;
        browser = await puppeteer.launch();
        browserStarting = false;
    }

    try {
        return await browser.newPage();
    } catch(err) {
        console.log(err);
    }

    browser = null;
    return null;
};

const sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const savePage = async function(url) {
    const page = await waitForNewPage();
    await page.goto(url, {waitUntil: 'networkidle2',  timeout: 100000});
    await page.setViewport({width: 1360, height: 768});

    const body = await page.content();
    const id = await upsertPage(url, {
        'url': url,
        'timestamp': Math.floor(Date.now()),
        'html': body
    });

    const dir = config.outDir + '/screenshots/';
    const filepath = dir + id + '.png';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    await page.screenshot({fullPage: true, path: filepath});
    await page.close();

    ////

    upsertPage(url, {
        'screenshot': filepath
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