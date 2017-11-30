'use strict';

var mongoose = require('mongoose');
var Task = mongoose.model('Task');


var addTask = function(userId, topicId, type, duration) {
    var T = new Task({
            userId: userId,
            topicId: topicId,
            taskType: type,
            taskDuration: duration,
            date: new Date
    });

    T.save(function(error) {
        if (error) {
            console.log('Could not create a new task.');
            console.log(error);
            return false;
        }
    });
}


exports.getTask = function(req, res) {
    var userId = req.params.userId;
    var topicId = req.query.topic || '';
    var type = req.query.type || '';
    var duration = req.query.duration || '';
   
    Task.find({userId: userId, topicId: topicId}, function(error, data) {
        if (!error) {
            if (data.length > 0) {
                var result = {
                    'found' : true,
                };     
                res.status(200).json(result);
            } else {
                var result = {
                    'found' : false
                };
                res.status(200).json(result);
                addTask(userId, topicId, type, duration);
            }
        } else {
            var result = {
                'found' : false
            };
            res.status(200).json(result);  
            addTask(userId, topicId, type, duration);
        }    
    });  
};
