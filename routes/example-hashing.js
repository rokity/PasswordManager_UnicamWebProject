var forge = require('node-forge');

module.exports = [
    {
        method: 'POST',
        path: '/api/hashing/',
        handler: (request, response) => {
            var toHash = request.payload.tohash;
             return response.response(JSON.stringify({hashed:hashIt(toHash)}))
      }
    }
]

function hashIt(toHash){
var salt = forge.random.getBytesSync(256);
var md = forge.md.sha512.create();
md.update(toHash+salt);
return md.digest().toHex();
}