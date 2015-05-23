
var colors = require('colors/safe');

var info = function () {
    var args = [colors.blue('[INFO] ')].concat(Array.prototype.slice.call(arguments, 0));
    console.log.apply(console, args);
};

var error = function () {
    var args = [colors.red('[ERROR] ')].concat(Array.prototype.slice.call(arguments, 0));
    console.log.apply(console, args);
};

module.exports = {
    info: info,
    error: error
};
