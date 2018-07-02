var bcrypt = require('bcrypt');

let uuid = 1;
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
            var account  = null;
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
                        account = {email:email,__u:val};
                        const sid = String(++uuid);
                        req.server.app.cache.set(sid, { account }, 0);
                        req.cookieAuth.set({ sid });
                        return res.redirect('/home');
                    }
                    else {

                        return res.redirect('http://localhost:4200/login');
                    }
                });
            }).catch(function (err) {
                return res.redirect('http://localhost:4200/login');
            })
        },
    },
]