'use strict';

const Task = require('../app/controllers/task');

module.exports = function(io) {

    const gio = io.of('/group');
    gio.on('connection', (socket) => {

        socket.on('register', (data) => {
            socket.userId = data.userId;
            socket.groupId = Task.getGroupId(socket.userId);
            socket.join(socket.groupId);
        });

        socket.on('pretestScore', async (data) => {
            await Task.savePretestScores(socket.userId, data.scores);
            await Task.getGroupTopic(socket.groupId).then((topicId) => {
                console.log(topicId);
                if (topicId) {
                    gio.to(socket.groupId).emit('groupTopic', {
                        groupId: socket.groupId,
                        topicId: topicId
                    });
                }
            });
        });

        ////

        socket.on('pushSearchState', (data) => {
            socket.broadcast.to(socket.groupId).volatile.emit('syncSearch', data);
        });
    });
};