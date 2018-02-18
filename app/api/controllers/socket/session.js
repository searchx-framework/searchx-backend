'use strict';

const redis = require('../../../config/initializers/redis');
const task = require('../../../services/session/task/learning');
const helper = require('../../../services/session/helper');

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

exports.handlePretestStart = async function(socket, io, data) {
    await setUserSocket(data.userId, socket.id);

    const group = await helper.getGroupByUserId(data.userId, data.taskId);
    if (group !== null) {
        socket.sessionId = group._id;
        socket.join(group._id);

        group.members.forEach(async (member) => {
            if (member.userId !== data.userId) {
                const socketId = await getUserSocket(member.userId);
                io.to(socketId).emit('pretestStart', {});
            }
        });
    }
};

exports.handlePretestSubmit = async function(socket, io, data) {
    await task.savePretestResults(data.userId, data.taskId, data.results);
    const group = await task.setGroupTopic(data.userId);

    if (group !== null) {
        console.log(`Group ${group._id} has been assigned topic "${group.topic.title}" (${group.task})`);
        io.to(socket.sessionId).emit('groupData', {
            group: group
        });
    }
};

exports.handlePretestLeave = async function(socket, io, data) {
    await task.removeUserFromGroup(data.userId, data.taskId);
    console.log(`${data.userId} has been removed (${data.taskId})`);
};