'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const config = require('../app/config/config');
const mongoose = require('mongoose');
mongoose.connect(config.db, {useMongoClient: true});
mongoose.Promise = global.Promise;

const supertest = require('supertest');
const should = require('should');

const Log = require('../app/models/log');
const log = require('../app/services/log');

describe('log', function () {
    const uid = '123';
    const sid = '123';
    let eventQueue = [];

    it('should handle the addition of a log entry', async function (done) {
        eventQueue = [];
        eventQueue.push({
            userId: uid,
            sessionId: sid,
            event: "EVENT",
            meta: {},
            date: new Date()
        });

        try {
            await log.createLog(uid, eventQueue);
            done();
        } catch(err) {
            console.log(err);
        }
    });
    
    it('should reject the addition of a non-sensible log entry', async function (done) {
        eventQueue = [];
        eventQueue.push("test");

        try {
            await log.createLog(uid, eventQueue);
        } catch(err) {
            done();
        }
    });

    it('should reject the addition of a log entry if url user id and data user id do not match', async function (done) {
        eventQueue = [];
        eventQueue.push({
            userId: "100",
            event: 'e1',
            meta: {},
            date: new Date()
        });

        try {
            await log.createLog(uid, eventQueue);
        } catch(err) {
            done();
        }
    });
   
    it('should handle the addition of multiple log entries', async function (done) {
        eventQueue = [];
        eventQueue.push({
            userId: uid,
            sessionId: sid,
            event: 'e1',
            meta: {},
            date: new Date()
        });
        eventQueue.push({
            userId: uid,
            sessionId: sid,
            event: 'e2',
            meta: {},
            date: new Date()
        });
        eventQueue.push({
            userId: uid,
            sessionId: sid,
            event: 'e3',
            meta: {},
            date: new Date()
        });

        try {
            await log.createLog(uid, eventQueue);
            done();
        } catch(err) {
            console.log(err);
        }
    });
});

