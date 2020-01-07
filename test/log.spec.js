'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const config = require('../app/config/config');
const mongoose = require('mongoose');
mongoose.connect(config.testDb,  {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;

const should = require('should');
const Log = require('../app/models/log');
const log = require('../app/services/log');

describe('log', function() {
    let eventQueue = [];
    const uid = '123';
    const sid = '123';
    const entry = function(event) {
        return {
            userId: uid,
            sessionId: sid,
            event: "__TEST__" + event,
            meta: {}
        }
    };

    after(function() {
        const query = {
            event: {
                $regex: `__TEST__.*`
            }
        };

        Log.remove(query, () => {});
    });

    ////

    it('should handle the addition of a log entry', async function () {
        eventQueue = [];
        eventQueue.push(entry("E1"));

        const res = await log.insertLogs(uid, eventQueue);
        res.length.should.be.exactly(1);
    });
   
    it('should handle the addition of multiple log entries', async function () {
        eventQueue = [];
        eventQueue.push(entry("E1"));
        eventQueue.push(entry("E2"));
        eventQueue.push(entry("E3"));

        const res = await log.insertLogs(uid, eventQueue);
        res.length.should.be.exactly(3);
    });

    it('should filter out non-sensible log entries', async function () {
        eventQueue = [];
        eventQueue.push("test1");
        eventQueue.push("test2");
        eventQueue.push(entry("E1"));

        const res = await log.insertLogs(uid, eventQueue);
        res.length.should.be.exactly(1);
    });

    it('should filter out log entry if url user id and data user id do not match', async function () {
        eventQueue = [];
        const wrongEntry = entry("E1");
        wrongEntry.userId = "100";
        eventQueue.push(wrongEntry);

        const res = await log.insertLogs(uid, eventQueue);
        res.length.should.be.exactly(0);
    });
});

