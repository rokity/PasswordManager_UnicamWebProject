const Hapi = require('hapi');
var sqlite = require('sqlite-cipher')
var port = process.argv[2];
var host= process.argv[3];

const server = Hapi.server({
  host: host,
  port: port,
});



async function start() {

  try {

    //Lista di routes del web-server
    server.route(require('./routes'));
    //docs generator
    await server.register([require('vision'), require('inert'), require('lout')]);
    
    server.start();
  }
  catch (err) {
    console.log(err);
    process.exit(1);
  }

  console.log('DominKey Server running at:', server.info.uri);
};

//TOKEN ARRAY
global.tokens = [];
//DB Initialization
try {
  var readlineSync = require('readline-sync');
  var pw = readlineSync.question('Inserisci password del database ', {
    hideEchoBack: true
  });
  sqlite.connect('./db/dominkey.enc',/*psw*/ pw, 'aes-256-cbc');
  console.log('Connected to the Dominkey database.');
  sqlite.run("CREATE TABLE IF NOT EXISTS User (ID INTEGER PRIMARY KEY AUTOINCREMENT, NAME VARCHAR NOT NULL, SURNAME VARCHAR NOT NULL, EMAIL VARCHAR NOT NULL, MASTERKEY VARCHAR NOT NULL);");
  sqlite.run("CREATE TABLE IF NOT EXISTS Psw (ID INTEGER PRIMARY KEY AUTOINCREMENT, DOMAIN VARCHAR NOT NULL, PASSWORD VARCHAR NOT NULL, USERID INTEGER NOT NULL, CREATED DATETIME DEFAULT CURRENT_TIMESTAMP, MODIFIED DATETIME);");
  }
catch (error) {
  console.log("Password errata, riavvia il server.");
}

//Global variables
global.uuid = 1;
global.sqlite= sqlite;
global.Promise= Promise;


start();