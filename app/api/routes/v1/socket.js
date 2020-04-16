'use strict';

const FeatureCtrl = require('../../controllers/socket/feature');
const SessionCtrl = require('../../controllers/socket/session');

module.exports = function(io) {
    const gio = io.of('/session');
    gio.on('connection', (socket) => {
        // Register
        socket.on('register', async (data) => {
            console.log('user connected: ' + data.userId);
            if (data.groupId) {
                socket.sessionId = data.groupId;
                socket.join(data.groupId);
            }
        });

        // Join Group
        socket.on('joinGroup', async (data) => {
            if (data.groupId) {
                try {
                    console.log('user completed registration: ' + data.userId);
                    if (socket.sessionId) {
                        socket.leave(socket.sessionId);
                    }
                    socket.join(data.groupId);
                    if (data.groupComplete) {
                        // TODO: separate join group and handle sync submit
                        data.data = {};
                        const res = await SessionCtrl.handleSyncSubmit(socket, gio, data);
                        io.to(data.groupId).emit('syncData', res);
                    }
                } catch(e) {
                    console.log(e);
                }
            } else {
                console.log('joinGroup event without groupId occurred: ' + data)
            }
        });

        // Feature
        socket.on('pushSearchState', (data) => FeatureCtrl.broadcastSearchState(socket, gio, data));
        socket.on('pushViewState', (data) => FeatureCtrl.broadcastViewState(socket, gio, data));
        socket.on('pushBookmarkUpdate', (data) => FeatureCtrl.broadcastBookmarkUpdate(socket, gio, data));
        socket.on('pushChatUpdate', (data) => FeatureCtrl.broadcastChatUpdate(socket, gio, data));
        socket.on('pushPageMetadataUpdate', (data) => FeatureCtrl.broadcastPageMetadataUpdate(socket, gio, data));

        // Pretest
        socket.on('pushSyncSubmit', (data) => SessionCtrl.handleSyncSubmit(socket, gio, data));

        // Task exceptions
        socket.on('pushSyncLeave', async (data) => {
            console.log('user left: ' + data.userId);
            socket.leave(data.groupId);
            return await SessionCtrl.handleSyncLeave(socket, gio, data)
        });
        socket.on('pushSyncLeaveGroup', async (data) => {
            console.log('user left previour group: ' + data.userId);
            socket.leave(data.groupId);
        });
        socket.on('pushSyncTimeout', async (data) => {
            if (data.groupId) {
                console.log('user timed out: ' + data.userId);
                return await SessionCtrl.handleSyncTimeout(socket, gio, data);
            } else {
                console.log('pushSyncTimeout event without groupId occurred: ' + data)
            }
        })
    });
};