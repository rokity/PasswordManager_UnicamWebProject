var mkdirp = require('mkdirp');
var path = require('path');
var db_path= path.join(__dirname, '/../db');
//create folder for db
mkdirp(db_path, function (err) {
    if (err) console.error(err)
    else console.log('db folder created!')
});