var forge = require('node-forge');

module.exports = [
    {
        method: 'POST',
        path: '/api/hashing/',
        handler: (request, response) => {
            var toHash = request.payload.tohash;
            return response.response(JSON.stringify({ hashed: hashIt(toHash) }))
        },
        options:{
            cors:true
        }
    }
]

let hashIt = (toHash) => {
    var md = forge.md.sha512.create();
    md.update(toHash);
    return md.digest().toHex();
}