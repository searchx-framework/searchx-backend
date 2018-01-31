'use strict';

const queryhistory = require('../../../services/session/queryhistory');

exports.broadcastSearchState = async function(socket, io, data) {
    socket.broadcast.to(socket.sessionId).volatile.emit('searchState', data);
    queryhistory.pushQueryHistory(data.sessionId, data.userId, data.state.query)
        .catch((err) => console.log(err));
};

exports.broadcastBookmarkUpdate = async function(socket, io, data) {
    socket.broadcast.to(socket.sessionId).volatile.emit('bookmarkUpdate', data);
};