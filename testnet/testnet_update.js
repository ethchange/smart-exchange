var fs = require('fs');

var update = function(path, owner, namereg) {
    var buffer = fs.readFileSync(path);
    var object = JSON.parse(buffer.toString()) || {};
    object.owner = owner;
    object.namereg = namereg;
    fs.writeFileSync(path, JSON.stringify(object, null, 2)); 
};

module.exports = update;

