'use strict';

var mongoose = require('mongoose');
var Bookmark      = mongoose.model('Bookmark');
var User      = mongoose.model('User');


exports.addBookmark = function(req, res) {
    var data = req.body;
    
    Bookmark.findOne({url: data.url, userId: data.userId}, 
        function (err, doc){
            if (!err) {
                if (!doc) {
                    data.deleted = false;
                    data.date = new Date();
                    
                    var B = new Bookmark(data);
                    B.save(function(error) {
                        if (error) {
                            res.status(401).json({
                                error: true,
                                message: 'Could not create a new bookmark.'
                            });
                        } else {
                            res.status(201).json({error: false});
                        }
                    });

                }  else {
                        if (doc.deleted == true) {
                            doc.deleted = false;
                            doc.save();
                        }
                        res.status(201).json({error: false});
                }
             } else {
                res.status(401).json({
                    error: true,
                    message: 'Could not create a new bookmark.'
                });
            }
                
        }
    );
};

exports.getBookmarks = function(req, res) {
    var userId = req.params.userId;
    Bookmark.find({userId: userId, deleted: false }, {url:1, title: 1, _id: 0}).sort({date:'descending'})
        .exec(function(error, data) {
            if (!error) {
                    res.status(201).json({error: false, results: data }); 
            } else {
                res.status(401).json({
                    error: true,
                    message: 'Could not get bookmarks.'
                });
            }     
        });    
}

exports.isBookmarked = function(userId, url, callback) {
    Bookmark.find({userId: userId, url: url, deleted: false })
        .exec(function(error, data) {
        
        if (!error) {
            if (data.length == 0) { 
                callback(false,{});
            } else {
                callback(true);
            }     
        } else {
            callback(false);  
        }    
    });
 }


exports.removeBookmark = function(req,res){

    var data = req.body;
    if (data.userId == null) {
        res.status(401).json({
            error: true,
            message: 'Could not delete bookmark.'
        });
    }
    Bookmark.findOne({url: data.url, userId: data.userId}, 
        function (err, doc){
            if (err) {
                res.status(401).json({
                    error: true,
                    message: 'Could not delete bookmark.'
                });

            } else {
                if (doc) {
                    doc.deleted = true;
                    doc.save();
                    res.status(201).json({error: false});
                } else {
                    res.status(401).json({
                        error: true,
                        message: 'Could not delete bookmark.'
                    }); 
                }
            }
        }
    );

}
