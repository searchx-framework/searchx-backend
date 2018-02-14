'use strict';

const session = require('../../../services/session');

exports.getUserTask = function(req, res) {
    const userId = req.params.userId;
    const collaborative = req.query.collaborative === 'true';

    session.getUserTask(userId, collaborative)
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