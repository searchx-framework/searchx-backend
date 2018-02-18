'use strict';

const feature = require('../../controllers/socket/feature');
const session = require('../../controllers/socket/session');

////

module.exports = function(io) {
    const gio = io.of('/session');
    gio.on('connection', (socket) => {

        socket.on('register', async (data) => {
            console.log(data.userId + ' has connected ' + "(" + socket.id + ")");
            socket.sessionId = data.sessionId;
            socket.join(data.sessionId);
        });

        socket.on('pushSearchState', (data) => feature.broadcastSearchState(socket, gio, data));
        socket.on('pushBookmarkUpdate', (data) => feature.broadcastBookmarkUpdate(socket, gio, data));
        socket.on('pushPageMetadataUpdate', (data) => feature.broadcastPageMetadataUpdate(socket, gio, data));

        socket.on('pushPretestStart', (data) => session.handlePretestStart(socket, gio, data));
        socket.on('pushPretestSubmit', (data) => session.handlePretestSubmit(socket, gio, data));
        socket.on('pushPretestLeave', (data) => session.handlePretestLeave(socket, gio, data));
    });
};