const Hapi = require('hapi');
var sqlite = require('sqlite-cipher')
var port = process.argv[2];

const server = Hapi.server({
  host: 'localhost',
  port: port,
});


async function start() {

  try {

    //Lista di routes del web-server
    server.route(require('./routes'));

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
  sqlite.connect('./db/dominkey.enc',/*psw*/ 'dominkey', 'aes-256-cbc');
  console.log('Connected to the Dominkey database.');
  sqlite.run("CREATE TABLE IF NOT EXISTS User (ID INTEGER PRIMARY KEY AUTOINCREMENT, NAME VARCHAR(15) NOT NULL, SURNAME VARCHAR(15) NOT NULL, EMAIL VARCHAR(20) NOT NULL, MASTERKEY VARCHAR NOT NULL);");
  sqlite.run("CREATE TABLE IF NOT EXISTS Psw (ID INTEGER PRIMARY KEY AUTOINCREMENT, DOMAIN VARCHAR(40) NOT NULL, PASSWORD VARCHAR(30) NOT NULL, USERID INTEGER NOT NULL, CREATED DATETIME DEFAULT CURRENT_TIMESTAMP, MODIFIED DATETIME);");
}
catch (error) {
  console.error("error", error)
}

//Global variables
global.uuid = 1;
global.sqlite= sqlite;
global.Promise= Promise;


start();