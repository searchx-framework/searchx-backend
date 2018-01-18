'use strict';

const Task = require('../../service/task');

exports.getUserTask = function(req, res) {
    const userId = req.params.userId;
    Task.getUserTask(userId)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((err) => {
            console.log(err);

            res.status(401).json({
                error: true,
                message: 'Could not get user task.'
            });
        });
};