'use strict';

const queryhistory = require('../../../services/session/queryhistory');
const view = require('../../../services/session/view');

exports.broadcastSearchState = async function(socket, io, data) {
    socket.broadcast.to(socket.sessionId).volatile.emit('searchState', data);
    queryhistory.pushQueryHistory(data.sessionId, data.userId, data.state.query)
        .catch((err) => console.log(err));
};

exports.broadcastViewState = async function(socket, io, data) {
    socket.broadcast.to(socket.sessionId).volatile.emit('viewState', data);
    view.pushView(data.sessionId, data.userId, data.state.url)
        .catch((err) => console.log(err));
};

exports.broadcastBookmarkUpdate = async function(socket, io, data) {
    socket.broadcast.to(socket.sessionId).volatile.emit('bookmarkUpdate', data);
};

exports.broadcastPageMetadataUpdate = async function(socket, io, data) {
    socket.broadcast.to(socket.sessionId).volatile.emit('pageMetadataUpdate', data);
};