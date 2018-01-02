'use strict';

const Task = require('../app/controllers/task');

module.exports = function(io) {

    const gio = io.of('/group');
    gio.on('connection', (socket) => {

        socket.on('register', (data) => {
            const groupId = Task.getGroupId(data.userId);

            socket.groupId = groupId;
            socket.join(groupId);
        });

        ////

        socket.on('pushPretestScores', async (data) => {
            await Task.savePretestScores(data.userId, data.scores);
            const topicId = await Task.getGroupTopic(socket.groupId);

            if (topicId) {
                gio.to(socket.groupId).emit('groupTopic', {
                    groupId: socket.groupId,
                    topicId: topicId
                });
            }
        });

        socket.on('pushGroupTimeout', async () => {
            const topicId = await Task.disableGroup(socket.groupId);

            if (topicId) {
                gio.to(socket.groupId).emit('groupTopic', {
                    groupId: socket.groupId,
                    topicId: topicId
                });
            }
        });

        ////

        socket.on('pushSearchState', (data) => {
            socket.broadcast.to(socket.groupId).volatile.emit('searchState', data);
        });
    });
};