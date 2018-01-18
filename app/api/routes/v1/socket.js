'use strict';

const redis = require('../../../config/initializers/redis');
const Task = require('../../../service/task');
const Session = require('../../../service/session');

////

const REDIS_USER_SOCKET = "userSocket";

const getUserSocket = async function(userId) {
    const key = REDIS_USER_SOCKET + "-" + userId;
    return await redis.getAsync(key);
};

const setUserSocket = async function(userId, socketId) {
    const key = REDIS_USER_SOCKET + "-" + userId;
    await redis.setAsync(key, socketId);
};

////

module.exports = function(io) {

    const gio = io.of('/group');
    gio.on('connection', (socket) => {

        socket.on('register', async (data) => {
            console.log(data.userId + ' has connected ' + "(" + socket.id + ")");
            await setUserSocket(data.userId, socket.id);

            socket.groupId = data.groupId;
            socket.join(data.groupId);
        });

        ////

        socket.on('pushPretestScores', async (data) => {
            const group = await Task.getAvailableGroup(data.userId, data.scores);

            if (group !== null) {
                group.members.forEach(async (member) => {
                    const socketId = await getUserSocket(member.userId);
                    gio.to(socketId).emit('groupData', {
                        group: group
                    });

                    Task.popPretestScores(member.userId)
                });
            }
            else  {
                await Task.pushPretestScores(data.userId, data.sessionId, data.scores);
            }
        });

        socket.on('pushGroupTimeout', async (data) => {
            await Task.popPretestScores(data.userId);
        });

        ////

        socket.on('pushSearchState', async (data) => {
            socket.broadcast.to(socket.groupId).volatile.emit('searchState', data);
            Session.pushQueryHistory(data.sessionId, data.userId, data.state.query)
                .catch((err) => console.log(err));
        });

        socket.on('pushBookmarkUpdate', (data) => {
            socket.broadcast.to(socket.groupId).volatile.emit('bookmarkUpdate', data);
        });
    });
};