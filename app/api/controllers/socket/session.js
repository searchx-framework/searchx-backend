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
    if (res !== null) {
        console.log("groupId = " + data.groupId);
        io.to(data.groupId).emit('syncData', res);
    }
};