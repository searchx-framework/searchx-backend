'use strict';

const session = require('../../controllers/socket/session');
const learning = require('../../controllers/socket/learning');

////

module.exports = function(io) {
    const gio = io.of('/session');
    gio.on('connection', (socket) => {

        // Register
        socket.on('register', async (data) => {
            console.log(data.userId + ' has connected ' + "(" + socket.id + ")");
            socket.sessionId = data.sessionId;
            socket.join(data.sessionId);
        });

        // Session
        socket.on('pushSearchState', (data) => session.broadcastSearchState(socket, gio, data));
        socket.on('pushViewState', (data) => session.broadcastViewState(socket, gio, data));
        socket.on('pushBookmarkUpdate', (data) => session.broadcastBookmarkUpdate(socket, gio, data));
        socket.on('pushPageMetadataUpdate', (data) => session.broadcastPageMetadataUpdate(socket, gio, data));

        // Task
        socket.on('pushStartPretest', (data) => learning.handleStartPretest(socket, gio, data));
        socket.on('pushPretestScores', (data) => learning.handlePretestScores(socket, gio, data));
        socket.on('pushUserLeave', (data) => learning.handleUserLeave(socket, gio, data));
    });
};