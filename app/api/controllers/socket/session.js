'use strict';

const session = require('../../../services/session');

exports.handleSyncSubmit = async function(socket, io, data) {
    const res = await session.handleSyncSubmit(data.userId, data.taskId, data.data);
    if (res !== null) {
        io.to(socket.sessionId).emit('syncData', res);
    }
};

exports.handleSyncLeave = async function(socket, io, data) {
    await session.handleSyncLeave(data.userId, data.taskId);
};