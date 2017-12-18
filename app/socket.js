'use strict';

module.exports = function(io) {
    io.on('connection', (socket) => {

        console.log('Socket ' + socket.id + ' connected');

        socket.on('subscribeToSyncSearch', (data) => {
            //TODO : register to room according to pairing
        });

        socket.on('pushSearchState', (data) => {
            //TODO : only push to user's room
            socket.broadcast.volatile.emit('syncSearch', data);
        });
    });
};