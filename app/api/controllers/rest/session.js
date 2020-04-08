'use strict';

const session = require('../../../services/session');

const resolve = function(req, res, promise, errorMessage) {
    promise
        .then((data) => {
	
            res.status(200).json({
                error: false,
                results: data
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(404).json({
                error: true,
                message: errorMessage
            });
        });
};

exports.getUserTask = function(req, res) {
    const userId = req.params.userId;
    const task = req.params.task;
    const params = req.query;
    resolve(req, res,
        session.getUserTask(userId, task, params),
        'Could not get user task.'
    );
};


exports.postUserTask = function(req, res) {
    const userId = req.params.userId;
    const task = req.params.task;
   // const params = req.query;
    const data = req.body;
// console.log("post data", data)
    resolve(req, res,
        session.postUserTask(userId, task, data),
        'Could not post  user task.'
    );
};

exports.getUserData = function(req, res) {
    const userId = req.params.userId;
    const task = req.params.task;
    resolve(req, res,
        session.getUserData(userId, task),
        'User not found.'
    );
};
