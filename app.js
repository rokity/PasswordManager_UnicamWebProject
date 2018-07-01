const Hapi = require('hapi');
var sqlite3 = require('sqlite3').verbose();

var port = process.argv[2];

const server=Hapi.server({
  host:'localhost',
  port:port
});

//Lista di routes del web-server
const routes = require('./routes');
//collegarle a Hapi
server.route(routes);

async function start() {

  try {
       server.start();
  }
  catch (err) {
      console.log(err);
      process.exit(1);
  }

  console.log('Server running at:', server.info.uri);
};

start();
