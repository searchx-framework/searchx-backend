const mongoose = require('mongoose');
const Group = mongoose.model('Group');
const randomColor = require('randomcolor');

exports.getGroupById = async function(groupId) {
    const query = Group.findOne({'_id': groupId});
    return await query.exec()
        .catch((err) => {
            console.log(err);
        });
};

exports.getGroupByUserId = async function(userId, taskId) {
    const query = {
        taskId: taskId,
        members: {
            $elemMatch: {
                userId: userId
            }
        }
    };

    const group = await Group.find(query, {}, {sort: {created: -1}});
    if (group.length > 0) {
        const groupId = group[0]._id;
        return await this.getGroupById(groupId);
    }

    return null;
};

exports.initializeMember = function(userId, meta) {
    return {
        userId: userId,
        color: randomColor({luminosity: 'dark'}),
        joined: new Date(),
        meta: meta
    };
};