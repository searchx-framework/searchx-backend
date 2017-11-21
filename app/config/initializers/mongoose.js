'use strict';

// Initializing system variables
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');

module.exports = function(dbString) {
    // Bootstrap db connection
    var db = mongoose.connect(dbString);
    mongoose.Promise = global.Promise;
    mongoose.connection.on('error', function(err){
        console.log('MongoDB is Down, Error:');
        throw err;
    });

    // Bootstrap models
    var rootPath = path.normalize(__dirname + '/../../..');
    var models_path = rootPath + '/app/models';
    var walk = function(path) {
        fs.readdirSync(path).forEach(function(file) {
            var newPath = path + '/' + file;
            var stat = fs.statSync(newPath);
            if (stat.isFile()) {
                if (/(.*)\.(js$|coffee$)/.test(file)) {
                    require(newPath);
                }
            } else if (stat.isDirectory()) {
                walk(newPath);
            }
        });
    };
    walk(models_path);
};