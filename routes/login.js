var bcrypt = require('bcrypt');


module.exports = [
    {
        method: ['POST'],
        path: '/api/login',
        config: {
            cors: true,
            auth: { mode: 'try' },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } },
        },
        handler: (req, res) => {
            var email = req.payload.email;
            var masterkey = req.payload.masterkey;
            return new Promise((resolve, reject) => {
                global.sqlite.run(`SELECT MASTERKEY as key FROM User WHERE EMAIL=('${email}')`, function (result) {
                    if (result.error)
                        reject(result.error);
                    else {
                        resolve(result[0].key);
                    }
                });;
            }).then((val) => {
                return bcrypt.compare(masterkey, val).then((value) => {
                    if (value) {
                        var account = {email:email,masterkey:val};
                        global.uuid = global.uuid+1;
                        const sid = String(global.uuid);
                        req.server.app.cache.set(sid, { account }, 0);
                        req.cookieAuth.set({ sid });
                        return res.response(JSON.stringify({logged:true}));
                    }
                    else {
                        return res.response(JSON.stringify({logged:false}));                        
                    }
                });
            }).catch(function (err) {
                return res.response(JSON.stringify({logged:false}));
            })
        },
    },
]