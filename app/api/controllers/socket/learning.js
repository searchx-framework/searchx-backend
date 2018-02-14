'use strict';

const redis = require('../../../config/initializers/redis');
const task = require('../../../services/session/task/learning');

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

exports.handleStartPretest = async function(socket, io, data) {
    await setUserSocket(data.userId, socket.id);

    const group = await task.getGroup(data.userId);
    if (group !== null) {
        socket.sessionId = group._id;
        socket.join(group._id);

        group.members.forEach(async (member) => {
            if (member.userId !== data.userId) {
                const socketId = await getUserSocket(member.userId);
                io.to(socketId).emit('startPretest', {});
            }
        });
    }
};

exports.handlePretestScores = async function(socket, io, data) {
    await task.savePretestScores(data.userId, data.scores);
    const group = await task.setGroupTopic(data.userId);

    if (group !== null) {
        console.log('Group ' + group._id + ' has been assigned topic "' + group.topic.title + '"');
        io.to(socket.sessionId).emit('groupData', {
            group: group
        });
    }
};

exports.handleUserLeave = async function(socket, io, data) {
    console.log(data.userId + ' has been removed ' + "(" + socket.id + ")");
    await task.removeUserFromGroup(data.userId);
};