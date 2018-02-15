const mongoose = require('mongoose');
const Group = mongoose.model('Group');

exports.getGroupById = async function(groupId) {
    const query = Group.findOne({'_id': groupId});
    return await query.exec()
        .catch((err) => {
            console.log(err);
        });
};

exports.getGroupIdByUserId = async function(userId, task) {
    const query = {
        task: task,
        members: {
            $elemMatch: {
                userId: userId
            }
        }
    };

    const group = await Group.find(query, {}, {sort: {created: -1}});
    if (group.length > 0) {
        return group[0]._id;
    }

    return null;
};