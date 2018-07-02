const Hapi = require('hapi');
var sqlite = require('sqlite-cipher')
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

  console.log('DominKey Server running at:', server.info.uri);
};
//DB Initialization
sqlite.connect('./db/dominkey.enc',/*psw*/ 'dominkey','aes-256-cbc');
console.log('Connected to the Dominkey database.'); 
sqlite.run("CREATE TABLE IF NOT EXISTS User (ID INTEGER PRIMARY KEY AUTOINCREMENT, NAME VARCHAR(15) NOT NULL, SURNAME VARCHAR(15) NOT NULL, EMAIL VARCHAR(20) NOT NULL, MASTERKEY VARCHAR NOT NULL);");        
// var rows = sqlite.run("SELECT * FROM User");
// console.log(rows);
global.sqlite= sqlite;
global.Promise= Promise;


start();