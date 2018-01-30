'use strict';

const Log = require('../../service/log');

exports.createLog = function(req, res) {
    const userId = req.params.userId;
    const eventData = req.body.data;

    Log.createLog(userId, eventData)
        .then(() => {
            res.status(201).json({
                error: false
            });
        })
        .catch((err) => {
            console.log(err);

            res.status(400).json({
                error: true,
                message: 'Could not create a new log.'
            });
        });
};
