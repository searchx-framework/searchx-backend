'use strict';

const session = require('../../../services/session');

exports.handleSyncSubmit = async function(socket, io, data) {
    const res = await session.handleSyncSubmit(data.userId, data.taskId, data.data);
if (res !== null) {
        io.to(data.groupId).emit('syncData', res);
    }
};

exports.handleSyncLeave = async function(socket, io, data) {
    await session.handleSyncLeave(data.userId, data.taskId);
};

exports.handleSyncTimeout = async function(socket, io, data) {
    const res = await session.handleSyncTimeout(data.userId, data.taskId);
    if (!res) {
        console.log('timeout group does not exist or double timeout occurred: {user: ' + data.userId + ' group: ' + data.groupId + '}')
    } else if (!res.newGroup) {
        io.to(data.groupId).emit('syncData', res.oldGroup);
    } else {
        // in case we split the user from the rest of the group to get the right groupsize,
        // remove the user from the old group's socket channel and add them to their own
        socket.leave(data.groupId);
        socket.join(res.newGroup._id);

        io.to(data.groupId).emit('syncData', res.oldGroup);
        io.to(res.newGroup._id).emit('syncData', res.newGroup);
    }
};
