'use strict';

// Initializing system variables
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

module.exports = function(dbString) {
    // Bootstrap db connection
    mongoose.connect(dbString,  {useNewUrlParser: true, useUnifiedTopology: true});
    mongoose.Promise = global.Promise;
    mongoose.connection.on('error', function(err){
        console.log('MongoDB is Down, Error:');
        throw err;
    });

    // Bootstrap models
    const walk = function(path) {
        fs.readdirSync(path).forEach(function(file) {
            const newPath = path + '/' + file;
            const stat = fs.statSync(newPath);
            if (stat.isFile()) {
                if (/(.*)\.(js$|coffee$)/.test(file)) {
                    require(newPath);
                }
            } else if (stat.isDirectory()) {
                walk(newPath);
            }
        });
    };

    const rootPath = path.normalize(__dirname + '/../../..');
    const models_path = rootPath + '/app/models';
    walk(models_path);
};