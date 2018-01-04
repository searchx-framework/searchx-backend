'use strict';

const Task = require('../app/controllers/task');

module.exports = function(io) {

    const gio = io.of('/group');
    gio.on('connection', (socket) => {

        socket.on('register', (data) => {
            console.log(data.userId + ' has connected');
            const groupId = Task.getGroupId(data.userId);

            socket.groupId = groupId;
            socket.join(groupId);
        });

        ////

        socket.on('pushPretestScores', async (data) => {
            await Task.savePretestScores(data.userId, data.sessionId, data.scores);
            const topicId = await Task.getGroupTopic(socket.groupId);
            const sessionId = await Task.getGroupSession(socket.groupId);

            if (topicId) {
                gio.to(socket.groupId).emit('groupTopic', {
                    groupId: socket.groupId,
                    sessionId: sessionId,
                    topicId: topicId
                });
            }
        });

        socket.on('pushGroupTimeout', async () => {
            const topicId = await Task.disableGroup(socket.groupId);
            const sessionId = await Task.getGroupSession(socket.groupId);

            if (topicId) {
                gio.to(socket.groupId).emit('groupTopic', {
                    groupId: socket.groupId,
                    sessionId: sessionId,
                    topicId: topicId
                });
            }
        });

        ////

        socket.on('pushSearchState', (data) => {
            socket.broadcast.to(socket.groupId).volatile.emit('searchState', data);
        });

        socket.on('pushBookmarkUpdate', () => {
            socket.broadcast.to(socket.groupId).volatile.emit('bookmarkUpdate', {});
        });
    });
};