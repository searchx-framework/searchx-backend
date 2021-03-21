'use strict';

const queryhistory = require('../../../services/features/queryhistory');
const view = require('../../../services/features/view');
const searchstate = require('../../../services/features/searchstate');

exports.broadcastSearchState = async function(socket, io, data) {
    socket.broadcast.to(data.groupId).emit('searchState', data);
    if (data.state.query !== '') {
         queryhistory.pushQueryHistory(data.sessionId, data.userId, data.state.query)
            .catch((err) => console.log(err));
        searchstate.pushSearchState(data.sessionId, data.userId, data.state).catch((err) => console.log(err));
    }
};

exports.broadcastViewState = async function(socket, io, data) {
    socket.broadcast.to(data.groupId).emit('viewState', data);
    view.pushView(data.sessionId, data.userId, data.state.url)
        .catch((err) => console.log(err));
};

exports.broadcastBookmarkUpdate = async function(socket, io, data) {
    socket.broadcast.to(data.groupId).emit('bookmarkUpdate', data.searchState);
};

exports.broadcastChatUpdate = async function(socket, io, data) {
    socket.broadcast.to(data.groupId).emit('chatUpdate', data);
};

exports.broadcastPageMetadataUpdate = async function(socket, io, data) {
    socket.broadcast.to(data.groupId).emit('pageMetadataUpdate', data);
};

exports.broadcastBasketUpdate = async function(socket, io, data) {
    socket.broadcast.to(data.groupId).emit('basketUpdate', data.searchState);
};