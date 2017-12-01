'use strict';

var mongoose = require('mongoose');
var Log      = mongoose.model('Log');

exports.createLog = function(req, res) {
    var eventData = req.body.data;
    var error = false;
    var userId = req.params.userId;

    for (var i = 0; i < eventData.length; i++ ) {
        if (typeof eventData[i] != 'object' || eventData[i].userId != userId){
            error = true;
            break;
        }
    }

    if (!error) {
        Log.insertMany(eventData, function(error) {
            if (error) {    
                res.status(400).json({
                    error: true,
                    message: 'Could not create a new log.' 
                });
            } else {
                res.status(201).json({ error: false});
            }
        });
    } else {   
        res.status(400).json({
            error: true,
            message: 'Could not create a new log.',        
        });
    }  
};
