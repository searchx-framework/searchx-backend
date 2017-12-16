'use strict';

module.exports = function(io) {
    io.on('connection', (socket) => {
        socket.on('subscribeToTimer', (interval) => {
            console.log('client is subscribing to timer with interval ', interval);

            setInterval(() => {
                socket.emit('timer', new Date());
            }, interval);
        });
    });
};