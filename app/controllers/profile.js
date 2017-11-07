'use strict';

var mongoose = require('mongoose');
var Profile      = mongoose.model('Profile');


var addProfile = function(userId, courseId) {
    var P = new Profile({
            userId: userId,
            courseId: courseId,
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
    var courseId = req.query.courseId || '';
   

    Profile.find({userId: userId, courseId: courseId}, function(error, data) {
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
                    addProfile(userId,courseId);
                }
            } else {
                var result = {
                    'found' : false
                };
                res.status(200).json(result);  
                addProfile(userId,courseId);
            }    
    });
    
};

