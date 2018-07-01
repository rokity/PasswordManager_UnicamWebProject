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
var md = forge.md.sha512.create();
md.update(toHash);
return md.digest().toHex();
}