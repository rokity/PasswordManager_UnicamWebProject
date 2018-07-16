const Joi = require('joi');
var bcrypt = require('bcrypt');

module.exports = [
    {
        method: ['GET'],
        path: '/api/profile/get',
        options: {
            cors: true,
            validate: {
                query: {
                    token: Joi.string().required(),
                }
            },
            response: {
                failAction: async (req, res, err) => { console.error("error", err); res.response({ error: err }) },
                status: {
                    200: Joi.object(
                        {
                            name: Joi.string(),
                            surname: Joi.string(),
                            email: Joi.string(),
                            authenticated: Joi.boolean().required(),
                        })
                }
            }
        },
        handler: (req, res) => {
            if (global.isAuthenticated(req.query)) {
                var id = global.tokens[req.query.token].account['id'];
                return new Promise((resolve, reject) => {
                    global.sqlite.run(`SELECT NAME AS name, SURNAME AS surname, EMAIL AS email FROM User WHERE ID=('${id}')`,
                        result => {
                            if (result.error) {
                                console.error("error", result.error)
                                reject(result.error);
                            }
                            else {
                                resolve(result);
                            }
                        });;
                }).then((val) => {
                    return res.response(JSON.stringify(
                        { authenticated: true, surname: val[0]['surname'], email: val[0]['email'], name: val[0]['name'] }));

                }).catch(function (err) {
                    return res.response(JSON.stringify({ authenticated: false }));
                })

            }
            else {
                return res.response(JSON.stringify({ authenticated: false }));
            }
        },
    },
    {
        method: ['PUT'],
        path: '/api/profile/modify',
        options: {
            cors: true,
            validate: {
                payload: {
                    token: Joi.string().required(),
                    name: Joi.string().max(15).required(),
                    surname: Joi.string().max(15).required(),
                    email: Joi.string().max(20).required(),
                    oldmasterkey: Joi.string().min(8).required(),
                    masterkey: Joi.string().min(8).required()
                }
            },
            response: {
                failAction: async (req, res, err) => { console.error("error", err); res.response({ error: err }) },
                status: {
                    200: Joi.object(
                        {
                            modified: Joi.boolean().required(),
                            matchold: Joi.boolean().required(),
                            mailUsed: Joi.boolean().required(),
                            authenticated: Joi.boolean().required(),
                            errordselect: Joi.any(),
                            errordupdate: Joi.any()
                        })
                }
            }
        },
        handler: (req, res) => {
            if (global.isAuthenticated(req.payload)) {
                var id = global.tokens[req.payload.token].account['id'];
                var oldmasterkey = req.payload.oldmasterkey;
                var masterkey = req.payload.masterkey;
                var name = req.payload.name;
                var surname = req.payload.surname;
                var email = req.payload.email;
                return new Promise((resolve, reject) => {
                    global.sqlite.run(`SELECT MASTERKEY as key FROM User WHERE ID=('${id}')`, function (result) {
                        if (result.error) {
                            console.error("error", result.error)
                            reject(result.error);
                        }
                        else {
                            resolve(result);
                        }
                    });;
                }).then((val) => {
                    return bcrypt.compare(oldmasterkey, val[0].key).then((value) => {
                        if (value) {
                            return bcrypt.genSalt(10).then((salt) => {
                                return bcrypt.hash(masterkey, salt).then((value) => {
                                    return new Promise((resolve, reject) => {
                                        global.sqlite.run(`SELECT COUNT(*) as counter FROM User WHERE EMAIL='${email}' AND ID !='${id}'`, function (count) {
                                            if (!count.error) {
                                                if (count[0].counter > 0) {
                                                    reject({ mailUtilizzata: true });
                                                } else global.sqlite.run(`UPDATE User SET NAME='${name}', SURNAME ='${surname}', EMAIL='${email}', MASTERKEY ='${value}' WHERE ID='${id}' `, function (row) {
                                                    if (row.error)
                                                        reject(row.error)
                                                    else {
                                                        resolve(row);
                                                    }
                                                });;
                                            } else reject(count.error);
                                        })
                                    }).then((val) => {
                                        var account = { email: email, id: id };
                                        global.tokens[req.payload.token].account = account;
                                        return res.response(JSON.stringify({ authenticated: true, matchold: true, modified: true, mailUsed: false }));
                                    }).catch(function (err) {
                                        if (err.mailUtilizzata == true)
                                            return res.response(JSON.stringify({ authenticated: true, matchold: true, mailUsed: true, modified: false }));
                                        else {
                                            console.error(err)
                                            return res.response(JSON.stringify({ matchold: true, authenticated: true, modified: false, mailUsed: false, errordupdate: err}));
                                        }
                                    })
                                })
                            })
                        } else return res.response(JSON.stringify({ authenticated: true, matchold: false, modified: false, mailUsed: false }));
                    });
                }).catch(function (err) { return res.response(JSON.stringify({ authenticated: true, matchold: false, modified: false, mailUsed: false, errordselect: err}));})
            }
            else {return res.response(JSON.stringify({ authenticated: false, matchold: false, modified: false, mailUsed: false }));
            }
        },
    }
];