var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var app = express();

var port = process.argv[2];

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(port, function () {
  console.log(`Dominkey server listening on port ${port}!`);
});
