var bcrypt = require('bcrypt');

module.exports = [
    {
        method: 'POST',
        path: '/api/registation',
        config: {
            cors: true,
        },
        handler: (req, res) => {
            var name = req.payload.name;
            var surname = req.payload.surname;
            var email = req.payload.email;
            var masterkey = req.payload.masterkey;
            return bcrypt.genSalt(10).then((salt) => {
                return bcrypt.hash(masterkey, salt).then((value) => {
                    return new Promise((resolve, reject) => {
                        global.sqlite.run(`SELECT COUNT(*) as counter FROM User WHERE EMAIL='${email}'`, function (count) {
                            if (!count.error) {
                                if (count[0].counter > 0) {
                                    reject({ mailUtilizzata: true });
                                } else global.sqlite.run(`INSERT INTO User (NAME, SURNAME, EMAIL, MASTERKEY) VALUES ('${name}', '${surname}', '${email}', '${value}')`, function (row) {
                                    if (row.error)
                                        reject(row.error)
                                    else {
                                        resolve(row);
                                    }
                                });;
                            } else reject(count.error);
                        })
                    }).then((val) => {
                        var account = { email: email, id: val };
                        return global.tokenGenerator.then( token =>
                            {
                                global.tokens[token] = {account : account,expireDate :  global.expireDateGenerator()}
                                return res.response(JSON.stringify({ logged: true, mailUsed: false,token: token }));
                            })
                    }).catch(function (err) {
                        if (err.mailUtilizzata == true)
                            return res.response(JSON.stringify({ mailUsed: true, logged: false }));
                        else
                            return res.response(JSON.stringify({ logged: false, mailUsed: false }));
                    })
                })
            })
        }
    }
]

