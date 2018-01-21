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

        socket.on('pushStartPretest', async (data) => {
            const group = await Task.getUserGroup(data.userId);
            if (group !== null) {
                socket.groupId = group._id;
                socket.join(group._id);

                group.members.forEach(async (member) => {
                    if (member.userId !== data.userId) {
                        const socketId = await getUserSocket(member.userId);
                        gio.to(socketId).emit('startPretest', {});
                    }
                });
            }
        });

        socket.on('pushPretestScores', async (data) => {
            await Task.savePretestScores(data.userId, data.scores);
            const group = await Task.setGroupTopic(data.userId);

            if (group !== null) {
                gio.to(socket.groupId).emit('groupData', {
                    group: group
                });
            }
        });

        socket.on('pushUserLeave', async (data) => {
            await Task.removeUserFromGroup(data.userId);
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