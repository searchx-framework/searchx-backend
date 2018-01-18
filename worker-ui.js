'use strict';

// Launch kue app
const kue = require('kue');
console.log('Starting Worker UI');
kue.app.listen(3030);