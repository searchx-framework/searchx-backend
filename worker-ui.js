// Launch kue app
var kue = require('kue');
console.log('Starting Worker UI');
kue.app.listen(3030);