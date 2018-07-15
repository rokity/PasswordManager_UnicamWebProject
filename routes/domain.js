var forge = require('node-forge');
const Joi = require('joi');


module.exports = [
    {
        method: ['POST'],
        path: '/api/domain/add',
        options: {
            cors: true,
            validate: {
                payload: {
                    domain: Joi.string().max(40).required(),
                    psw: Joi.string().max(30).required(),
                    token: Joi.string().required()
                }
            },
            response: {
                failAction: async (req, res, err) => { console.error("error", err); res.response({ error: err }) },
                status: {
                    200: Joi.object(
                        {
                            DomainAdded: Joi.boolean().required(),
                            domainAlreadyInserted: Joi.boolean().required(),
                            authenticated: Joi.boolean().required(),
                        })
                }
            }
        },

        handler: (req, res) => {
            if (global.isAuthenticated(req.payload)) {
                const session = global.tokens[req.payload.token].account;
                var domain = req.payload.domain;
                var psw = req.payload.psw;

                return new Promise((resolve, reject) => {
                    global.sqlite.run(`SELECT COUNT(*) as counter FROM Psw WHERE USERID='${session.id}' AND DOMAIN='${domain}'`, function (count) {
                        if (!count.error) {
                            if (count[0].counter > 0) {
                                reject({ domainAlreadyInserted: true });
                            } else {
                                return encryptDom(session.id, psw).then((encrypted) => {
                                    global.sqlite.run(`INSERT INTO Psw (DOMAIN, PASSWORD, USERID, MODIFIED) VALUES ('${domain}', '${encrypted}', '${session.id}', DATETIME('now'))`, function (row) {
                                        if (row.error)
                                            reject(row.error)
                                        else {
                                            resolve(row);
                                        }
                                    })
                                })
                            };;
                        } else reject(count.error);
                    })
                }).then((entry) => {
                    return res.response(JSON.stringify({ DomainAdded: true, domainAlreadyInserted: false, authenticated: true }));
                }).catch(function (err) {
                    if (err.domainAlreadyInserted) {
                        return res.response(JSON.stringify({ DomainAdded: false, domainAlreadyInserted: true, authenticated: true }));
                    } else {
                        console.log(err);
                        return res.response(JSON.stringify({ DomainAdded: false, domainAlreadyInserted: false, authenticated: true }));
                    }
                })
            }
            else {
                return res.response(JSON.stringify({ authenticated: false }));
            }
        },

    },

    {
        method: ['GET'],
        path: '/api/domain/get',
        options: {
            cors: true,
            validate: {
                query: {
                    token: Joi.string().required(),
                    domainID: Joi.string().required()
                }
            },
            response: {
                failAction: async (req, res, err) => { console.error("error", err); res.response({ error: err }) },
                status: {
                    200: Joi.object(
                        {
                            password: Joi.string(),
                            domain: Joi.boolean().required(),
                            authenticated: Joi.boolean().required(),
                        })
                }
            }
        },
        handler: (req, res) => {
            if (global.isAuthenticated(req.query)) {
                const session = global.tokens[req.query.token].account;
                var domainId = req.query.domainID;
                return new Promise((resolve, reject) => {
                    global.sqlite.run(`SELECT PASSWORD FROM Psw WHERE USERID=('${session.id}') AND ID=('${domainId}')`, function (row) {
                        if (row.error)
                            reject(row.error);
                        else {
                            resolve(row);
                        }
                    });;
                }).then((row) => {
                    if (row.length > 0) {
                        return decryptDom(session.id, row).then((decryptedRow) => {
                            return res.response(JSON.stringify({ authenticated: true, domain: true, password: decryptedRow[0]['PASSWORD'] }));
                        })
                    } else return res.response(JSON.stringify({ domain: false, authenticated: true }));
                }).catch(function (err) {
                    console.log(err);
                    return res.response(JSON.stringify({ domain: false, authenticated: true }));
                })
            }
            else {
                return res.response(JSON.stringify({ authenticated: false, domain: false }));
            }
        }
    },

    {
        method: ['GET'],
        path: '/api/domain/getall',
        options: {
            cors: true,
            validate: {
                query: {
                    token: Joi.string().required()
                }
            },
            response: {
                failAction: async (req, res, err) => { console.error("error", err); res.response({ error: err }) },
                status: {
                    200: Joi.object(
                        {
                            password: Joi.string(),
                            domains: [Joi.boolean(), Joi.array()],
                            authenticated: Joi.boolean().required(),
                        })
                }
            }
        },
        handler: (req, res) => {
            if (global.isAuthenticated(req.query)) {
                const session = global.tokens[req.query.token].account;
                return new Promise((resolve, reject) => {
                    global.sqlite.run(`SELECT ID as id, DOMAIN as domain, CREATED as created, MODIFIED as modified FROM Psw WHERE USERID=('${session.id}')`, function (list) {
                        if (list.error)
                            reject(list.error);
                        else {
                            resolve(list);
                        }
                    });;
                }).then((list) => {
                    if (list.length > 0)
                        return res.response(JSON.stringify({ domains: list, authenticated: true }));
                    else
                        return res.response(JSON.stringify({ domains: false, authenticated: true }));
                }).catch(function (err) {
                    console.log(err);
                    return res.response(JSON.stringify({ domains: false, authenticated: true }));
                })
            }
            else {
                return res.response(JSON.stringify({ authenticated: false, domains: false, }));
            }
        }
    },

    {
        method: ['PUT'],
        path: '/api/domain/modify',
        options: {
            cors: true,
            validate: {
                payload: {
                    domain: Joi.string().max(40).required(),
                    domainID: Joi.number().required(),
                    psw: Joi.string().max(30).required(),
                    token: Joi.string().required()
                }
            },
            response: {
                failAction: async (req, res, err) => { console.error("error", err); res.response({ error: err }) },
                status: {
                    200: Joi.object(
                        {
                            rows: Joi.number().required(),
                            authenticated: Joi.boolean().required(),
                            error:Joi.object()
                        })
                }
            }
        },
        handler: (req, res) => {
            if (global.isAuthenticated(req.payload)) {
                const session = global.tokens[req.payload.token].account;
                var domainID = req.payload.domainID;
                var domain = req.payload.domain;
                var updatedPsw = req.payload.psw;
                return new Promise((resolve, reject) => {
                    return encryptDom(session.id, updatedPsw).then((encrypted) => {
                        global.sqlite.run(`UPDATE Psw SET DOMAIN='${domain}', PASSWORD='${encrypted}', MODIFIED=DATETIME('now') WHERE ID=('${domainID}') AND USERID=('${session.id}')`, function (row) {
                            if (row.error)
                                reject(row.error);
                            else {
                                resolve(row);
                            }
                        });
                    })
                }).then((row) => {
                    if (row.length > 0) {
                        return res.response({authenticated: true,rows:row.length});
                    } else return res.response(JSON.stringify({authenticated: true,rows:0}));
                }).catch(function (err) {
                    console.log(err);
                    return res.response(JSON.stringify({error:err,authenticated: true,rows:0}));
                })
            }
            else {
                return res.response(JSON.stringify({ authenticated: false,rows:0 }));
            }
        }
    },
    {
        method: ['DELETE'],
        path: '/api/domain/delete',
        options: {
            cors: true,
            validate: {
                query: {
                    domainID: Joi.number().required(),
                    token: Joi.string().required()
                }
            },
            response: {
                failAction: async (req, res, err) => { console.error("error", err); res.response({ error: err }) },
                status: {
                    200: Joi.object(
                        {
                            deleted: Joi.number().required(),
                            authenticated: Joi.boolean().required(),
                            error:Joi.object()
                        })
                }
            }
        },
        handler: (req, res) => {
            if (global.isAuthenticated(req.query)) {
                const session = global.tokens[req.query.token].account;
                var domainID = req.query.domainID;
                return new Promise((resolve, reject) => {
                    global.sqlite.run(`DELETE FROM Psw WHERE ID=('${domainID}') AND USERID=('${session.id}')`, function (row) {
                        if (row.error)
                            reject(row.error);
                        else {
                            resolve(row);
                        }
                    });
                }).then((row) => {
                    return res.response({ authenticated: true,deleted:1 });
                }).catch(function (err) {
                    console.log(err);
                    return res.response(JSON.stringify({deleted:0 ,error:err,authenticated: true}));
                })
            }
            else {
                return res.response(JSON.stringify({ deleted:0 ,authenticated: false }));
            }
        }
    },
    {
        method: ['GET'],
        path: '/api/domain/search',
        options: {
            cors: true,
            validate: {
                query: {
                    domain: Joi.string().max(40).required(),
                    token: Joi.string().required()
                }
            },
            response: {
                failAction: async (req, res, err) => { console.error("error", err); res.response({ error: err }) },
                status: {
                    200: Joi.object(
                        {
                            foundDomain: Joi.boolean(),
                            authenticated: Joi.boolean().required(),
                            domain:Joi.object(),
                            error:Joi.object()
                        })
                }
            }
        },
        handler: (req, res) => {
            if (global.isAuthenticated(req.query)) {
                const session = global.tokens[req.query.token].account;
                var domain = req.query.domain;
                return new Promise((resolve, reject) => {
                    global.sqlite.run(`SELECT ID as id FROM Psw WHERE DOMAIN=('${domain}') AND USERID=('${session.id}')`, function (row) {
                        if (row.error)
                            reject(row.error);
                        else {
                            resolve(row);
                        }
                    });
                }).then((row) => {
                    if (row.length > 0) {
                        return res.response(JSON.stringify({ foundDomain: true, domain: row[0] ,authenticated: true}));
                    } else return res.response(JSON.stringify({ foundDomain: false ,authenticated: true}))
                }).catch(function (err) {
                    console.log(err);
                    return res.response(JSON.stringify({ authenticated: true,error:err, }));
                })
            }
            else {
                return res.response(JSON.stringify({ authenticated: false }));
            }
        }
    }
]

let encryptDom = (userId, domainClear) => {
    return new Promise((resolve, reject) => {
        global.sqlite.run(`SELECT MASTERKEY as psw FROM User WHERE ID=('${userId}')`, function (result) {
            if (result.error)
                reject(result.error);
            else {
                resolve(result[0].psw);
            }
        });;
    }).then((psw) => {
        var salt = forge.random.getBytesSync(128);
        var key = forge.pkcs5.pbkdf2(psw.substring(31, 60), salt, 10, 32);
        var iv = forge.random.getBytesSync(16);
        var cipher = forge.cipher.createCipher('AES-CBC', key);
        cipher.start({ iv: iv });
        cipher.update(forge.util.createBuffer(domainClear));
        cipher.finish();
        var encrypted = cipher.output.data;
        return (forge.util.encode64(iv + salt + encrypted));

    }).catch((err) => {
        console.log(err);
        throw err;
    })
}
let decryptDom = (userId, domainEncrypted) => {
    return new Promise((resolve, reject) => {
        global.sqlite.run(`SELECT MASTERKEY as psw FROM User WHERE ID=('${userId}')`, function (result) {
            if (result.error)
                reject(result.error);
            else {
                resolve(result[0].psw);
            }
        });;
    }).then((psw) => {
        domainEncrypted.forEach(function (row) {
            var decoded = forge.util.decode64(row.PASSWORD);
            var HashedMkey = psw.substring(31, 60);
            var encryptedPsw = decoded.substring(144, row.PASSWORD.length);
            var iv = decoded.substring(0, 16);
            var salt = decoded.substring(16, 144);
            var key = forge.pkcs5.pbkdf2(HashedMkey, salt, 10, 32);
            var decipher = forge.cipher.createDecipher('AES-CBC', key);
            decipher.start({ iv: iv });
            decipher.update(forge.util.createBuffer(encryptedPsw));
            var result = decipher.finish();
            if (result) {
                row.PASSWORD = decipher.output.data;
            }
        })
        return domainEncrypted;
    }).catch((err) => {
        console.log(err);
        throw err;
    })
}