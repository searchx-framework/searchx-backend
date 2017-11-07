'use strict';

var param          = require('node-jquery-param');
var mongoose       = require('mongoose');
var User           = mongoose.model('User');
var Client         = mongoose.model('Client');
var Token          = mongoose.model('Token');
var passport       = require('passport');
var BasicStrategy  = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var LocalStrategy  = require('passport-local').Strategy;
var config         = require('../config/config');

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(_id, done) {
    User.findById(_id, function(err, user) {
        if (err) {
            return done(err);
        }
        done(null, user);
    });
});

passport.use('client-basic', new BasicStrategy(function(clientId, password, callback) {
    Client.findOne({ _id: clientId }, function (error, client) {
        if (error) {
            return callback(error);
        }

        // No client found with that id or bad password
        if (! client || client.secret !== password) {
            return callback(null, false);
        }

        // Success
        return callback(null, client);
    });
}));

passport.use(new BearerStrategy(function(accessToken, callback) {
    Token.findOne({value: accessToken }, function (error, token) {
        if (error) {
            return callback(error);
        }

        // No token found
        if (!token) {
            return callback(null, false);
        }

        User.findOne({ _id: token.user }, function (error, user) {
            if (error) {
                return callback(error);
            }

            // No user found
            if (!user) {
                return callback(null, false);
            }

            // Simple example with no scope
            callback(null, user, { scope: '*' });
        });
    });
}));

passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback : true
    },
    function(req, email, password, callback) {
        User.findOne({ email: email.toLowerCase() }, function (error, user) {
            if (error) {
                return callback(error);
            }

            // No user found with that username
            if (!user) {
                return callback(null, false);
            }

            // Make sure the password is correct
            user.verifyPassword(password, function(err, isMatch) {
                if (error) {
                    return callback(error);
                }

                // Password did not match
                if (!isMatch) {
                    return callback(null, false);
                }

                // Success
                return callback(null, user);
            });
        });
    }
));

exports.isClientAuthenticated = passport.authenticate('client-basic', { session : false });
exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });
exports.isLocalAuthenticated = passport.authenticate('local-login', { failureRedirect: '/v1/login' });

exports.redirectAfterLogin = function(req, res) {
    var returnTo = req.session.returnTo;
    var returnToParams = req.session.returnToParams;
    delete req.session.returnTo;
    delete req.session.returnToParams;
    if (returnTo) {
        res.redirect('/v1' + returnTo + '?' + param(returnToParams));
    } else {
        res.redirect(config.client);
    }
};

exports.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.returnTo = req.path;
    req.session.returnToParams = req.query;
    res.redirect('/v1/login');
};

exports.logout = function(req, res) {
    req.logout();
    res.redirect('/v1/login');
};

exports.chromeExtension = function(req, res) {
    User.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
        if (err) {
            res.json({
                error: true,
                message: 'Cound not retrieve account details'
            });
        } else if (!user) {
            res.json({
                error: true,
                message: 'Invalid email or password'
            });
        } else {
            res.json(user);
        }
    });
};