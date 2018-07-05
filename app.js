const Hapi = require('hapi');
var sqlite = require('sqlite-cipher')
var port = process.argv[2];

const server = Hapi.server({
  host: 'localhost',
  port: port,
});





async function start() {

  try {
    await server.register(require('hapi-auth-cookie'))
    await server.register(Inert);
    const cache = server.cache({ segment: 'sessions', expiresIn: 1 * 1 * 60 * 60 * 1000 });
    server.app.cache = cache;
    
    server.auth.strategy('session', 'cookie', {
      password: 'password-should-be-32-characters',
      cookie: 'sid-example',
      isHttpOnly: true,
      keepAlive: true,
      domain:'127.0.0.1',
      path:'/login',
      ttl: 1000*60*60,
      isSameSite:'Strict',
      redirectTo: 'http://localhost:4200/login',
      isSecure: false,
      validateFunc: async (request, session) => {

        const cached = await cache.get(session.sid);
        const out = {
          valid: !!cached
        };

        if (out.valid) {
          out.credentials = cached.account;
        }

        return out;
      }
    });

    server.auth.default('session');

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
//DB Initialization
try {
  sqlite.connect('./db/dominkey.enc',/*psw*/ 'dominkey', 'aes-256-cbc');
  console.log('Connected to the Dominkey database.');
  sqlite.run("CREATE TABLE IF NOT EXISTS User (ID INTEGER PRIMARY KEY AUTOINCREMENT, NAME VARCHAR(15) NOT NULL, SURNAME VARCHAR(15) NOT NULL, EMAIL VARCHAR(20) NOT NULL, MASTERKEY VARCHAR NOT NULL);");
}
catch (error) {
  console.error("error", error)
}

//Global variables
global.uuid = 1;
global.sqlite= sqlite;
global.Promise= Promise;


start();