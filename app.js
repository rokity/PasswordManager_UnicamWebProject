const Hapi = require('hapi');
var sqlite3 = require('sqlite3').verbose();

var port = process.argv[2];

const server=Hapi.server({
  host:'localhost',
  port:port
});

server.route({
  method:'GET',
  path:'/',
  handler:function(request,h) {
      return'hello world';
  }
});

async function start() {

  try {
      await server.start();
  }
  catch (err) {
      console.log(err);
      process.exit(1);
  }

  console.log('Server running at:', server.info.uri);
};

start();
