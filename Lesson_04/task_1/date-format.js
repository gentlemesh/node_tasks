const moment = require('moment');

const now = moment();

console.log('DD-MM-YYYY :', now.format('DD-MM-YYYY'));
console.log('MMM Do YY :', now.format('MMM Do YY'));
console.log('dddd :', now.format('dddd'));