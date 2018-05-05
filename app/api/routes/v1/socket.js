'use strict';

const FeatureCtrl = require('../../controllers/socket/feature');
const SessionCtrl = require('../../controllers/socket/session');

module.exports = function(io) {
    const gio = io.of('/session');
    gio.on('connection', (socket) => {

        // Register
        socket.on('register', async (data) => {
            console.log('user connected: ' + data.userId);
            socket.sessionId = data.sessionId;
            socket.join(data.sessionId);
        });

        // Feature
        socket.on('pushSearchState', (data) => FeatureCtrl.broadcastSearchState(socket, gio, data));
        socket.on('pushViewState', (data) => FeatureCtrl.broadcastViewState(socket, gio, data));
        socket.on('pushBookmarkUpdate', (data) => FeatureCtrl.broadcastBookmarkUpdate(socket, gio, data));
        socket.on('pushPageMetadataUpdate', (data) => FeatureCtrl.broadcastPageMetadataUpdate(socket, gio, data));

        // Pretest
        socket.on('pushSyncSubmit', (data) => SessionCtrl.handleSyncSubmit(socket, gio, data));
        socket.on('pushSyncLeave', (data) => {
            console.log('user left: ' + data.userId);
            return SessionCtrl.handleSyncLeave(socket, gio, data)
        });
        socket.on('pushSyncTimeout', (data) => {
            console.log('user timed out: ' + data.userId);
            return SessionCtrl.handleSyncTimeout(socket, gio, data);
        })
    });
};