var bcrypt = require('bcrypt');
var moment = require('moment');
const Joi = require('joi');

module.exports = [
    {
        method: ['POST'],
        path: '/api/login',
        config: {
            cors: true,
            validate: {
                payload: {
                    email: Joi.string().required(),
                    masterkey: Joi.string().required()
                }
            }
        },

        handler: (req, res) => {
            var email = req.payload.email;
            var masterkey = req.payload.masterkey;
            return new Promise((resolve, reject) => {
                global.sqlite.run(`SELECT ID as id, MASTERKEY as key FROM User WHERE EMAIL=('${email}')`, function (result) {
                    if (result.error) {
                        console.log(result.error)
                        reject(result.error);
                    }
                    else {
                        resolve(result);
                    }
                });;
            }).then((val) => {
                return bcrypt.compare(masterkey, val[0].key).then((value) => {
                    if (value) {
                        var account = { email: email, id: val[0].id };
                        return global.tokenGenerator.then(token => {
                            global.tokens[token] = { account: account, expireDate: global.expireDateGenerator() }
                            return res.response(JSON.stringify({ logged: true, token: token }));
                        })

                    }
                    else {
                        return res.response(JSON.stringify({ logged: false }));
                    }
                });
            }).catch(function (err) {
                return res.response(JSON.stringify({ logged: false }));
            })
        },
    },
]

global.tokenGenerator = new Promise((resolve, reject) => {
    require('crypto').randomBytes(48, function (err, buffer) {
        var token = buffer.toString('hex');
        resolve(token);
    });
})

global.expireDateGenerator = () => {
    var data = moment();
    data.add(1, 'h')
    return data;
}

global.isAuthenticated = (params) => {
    //TODO: move token presence under BAD REQUEST response
    var token = global.tokens[params.token];
    if (token == undefined) {
        return false;
    } else {
        var expireDate = token.expireDate;
        var date = moment();
        if (moment(date).isAfter(expireDate))
            return false
        else
            return true;
    }
}
