'use strict';

var mongoose = require('mongoose');
var Rating      = mongoose.model('Rating');
var User      = mongoose.model('User');


exports.updateRating = function(req, res) {
    var data = req.body;
    data.date = new Date();
    var R = new Rating(data);
    R.save(function(error) {
        if (error) {
            res.json({
                error: true,
                message: 'Could not create a new rating.'
            });
        } else {
            res.status(201).json({error: false});
        }
    });
    
    User.findOne({ vertical: data.vertical, url: data.url, userId: data.userId, courseId : data.courseId }, 
        function (err, doc){
            if (err) {
                var U = new User({ vertical: data.vertical, url: data.url, userId: data.userId, 
                    courseId : data.courseId, signal: data.signal });
                U.save(function(error) {});
            } else {
                if (doc) {
                    doc.signal = data.signal;
                    doc.save();
                } else {
                    var U = new User({ vertical: data.vertical, url: data.url, userId: data.userId, 
                        courseId : data.courseId, signal: data.signal });
                    U.save(function(error) {});
                    
                }
            }
        }
    );



};

exports.getRating = function(vertical,url, courseId, callback){
    Rating.aggregate(
        [ {
            $match :  {vertical: vertical, url: url, courseId: courseId } ,
        },
        { $group : {
        _id : null,
            total : {
            $sum : "$discount"
            }
        }
    }], 
    function(err, res) {
        if (err) {
            callback(0);
        } else if (res.length > 0) {
            callback(res[0].total);
        } else {
            callback(0)
        }
    });
}


exports.userHasRated = function(vertical,url,userId, courseId, callback){
    User.find({vertical:vertical,url:url, userId: userId, courseId: courseId}, function(err, docs) {
        if (docs.length > 0) {
            callback(docs[0].signal);
        } else {
            callback("neutral");
        }
    });
}
