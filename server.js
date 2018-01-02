'use strict';

// Default to development environment if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load the config
const config = require('./app/config/config');

// Load dependencies
const express      = require('express');
const session      = require('express-session');
const connectMongo = require('connect-mongo')(session);
const bodyParser   = require('body-parser');
const swig         = require('swig');
const passport     = require('passport');

// Setup server
const app          = express();
const router       = express.Router();
const http         = require('http').Server(app);
const io           = require('socket.io').listen(http);

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
    name: 'searchx.api.sid',
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
http.listen(app.get('port'), function() {
    console.log('SearchX API is running on port', app.get('port'));
});
