'use strict';

// Default to development environment if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load the config
var config = require('./app/config/config');

// Load dependencies
var express      = require('express');
var session      = require('express-session');
var connectMongo = require('connect-mongo')(session);
var bodyParser   = require('body-parser');
var swig         = require('swig');
var passport     = require('passport');
var fs           = require('fs');

// Setup server
var app          = express();
var router       = express.Router();
var http         = require('http').Server(app);
var io           = require('socket.io')(http);

// Init
require('./app/config/initializers/mongoose')(config.db);
require('./app/router/v1')(router);
require('./app/socket')(io);

// Engine
app.engine('html', swig.renderFile);

// Set
console.log(process.env.PORT);
app.set('port', (process.env.PORT || config.port));
app.set('views', __dirname + '/app/views');
app.set('view engine', 'html');
app.set('view cache', false);

// Use
//if (process.env.NODE_ENV === 'development') {
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
});
//}

app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'gFCfcFnpwVIP682neT0KoPUymH6XVE669yMi8sZrbV',
    name: 'pienapple.api.sid',
    cookie: {maxAge: 3600000*24*365},
    store: new connectMongo({
        url: 'mongodb://heroku_dv02792b:ub5gq9n1aabpjna4nsofhp403k@ds047474.mongolab.com:47474/heroku_dv02792b',
        collection: 'sessions'
    })
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/v1', router);
app.get('/', function(req, res) {
    res.redirect(config.client);
});

// Start the server
console.log('Starting Server');
var server = http.listen(app.get('port'), function() {
    console.log('Pienapple API is running on port', app.get('port'));
});
