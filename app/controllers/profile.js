'use strict';

var mongoose = require('mongoose');
var Profile = mongoose.model('Profile');


var addProfile = function(userId, taskId) {
    var P = new Profile({
            userId: userId,
            taskId: taskId,
            date: new Date
    });
    P.save(function(error) {
        if (error) {
            console.log('Could not create a new profile.');
            console.log(error);
            return false;
        }
    });
}


exports.getProfile = function(req, res) {
    var userId = req.params.userId;
    var taskId = req.query.taskId || '';
   
    Profile.find({userId: userId, taskId: taskId}, function(error, data) {
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
                addProfile(userId, taskId);
            }
        } else {
            var result = {
                'found' : false
            };
            res.status(200).json(result);  
            addProfile(userId, taskId);
        }    
    });
    
};

