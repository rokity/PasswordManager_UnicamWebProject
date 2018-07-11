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
                    domain: Joi.string().required(),
                    psw: Joi.string().required(),
                    token: Joi.string().required()
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
                    return res.response(JSON.stringify({ DomainAdded: true, domainAlreadyInserted: false }));
                }).catch(function (err) {
                    if (err.domainAlreadyInserted) {
                        return res.response(JSON.stringify({ DomainAdded: false, domainAlreadyInserted: true }));
                    } else {
                        console.log(err);
                        return res.response(JSON.stringify({ DomainAdded: false, domainAlreadyInserted: false }));
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
        path: '/api/domain/getall',
        options: {
            cors: true,
            validate: {
                query: {
                    token: Joi.string().required()
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
                    if (list.length > 0) {
                        return res.response(list);
                    } else return res.response(JSON.stringify({ domains: false }));
                }).catch(function (err) {
                    console.log(err);
                    return res.response(JSON.stringify({ domains: false }));
                })
            }
            else {
                return res.response(JSON.stringify({ authenticated: false }));
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
                    domainID: Joi.string().required(),
                    updatedPsw: Joi.string().required(),
                    token: Joi.string().required()
                }
            }
        },
        handler: (req, res) => {
            if (global.isAuthenticated(req.payload)) {
                const session = global.tokens[req.payload.token].account;
                var domainID = req.payload.domainID;
                var updatedPsw = req.payload.psw;
                return new Promise((resolve, reject) => {
                    return encryptDom(session.id, updatedPsw).then((encrypted) => {
                        global.sqlite.run(`UPDATE Psw SET PASSWORD='${encrypted}', MODIFIED=DATETIME('now') WHERE ID=('${domainID}')`, function (row) {
                            if (row.error)
                                reject(row.error);
                            else {
                                resolve(row);
                            }
                        });
                    })
                }).then((row) => {
                    if (row.length > 0) {
                        return res.response(JSON.stringify("Updated"));
                    } else return res.response(JSON.stringify("Nothing to modify here"));
                }).catch(function (err) {
                    console.log(err);
                    return res.response(JSON.stringify("An error occurred"));
                })
            }
            else {
                return res.response(JSON.stringify({ authenticated: false }));
            }
        }
    },
    {
        method: ['POST'],
        path: '/api/domain/delete',
        options: {
            cors: true,
            validate: {
                payload: {
                    domainID: Joi.string().required(),
                    token: Joi.string().required()
                }
            }
        },
        handler: (req, res) => {
            if (global.isAuthenticated(req.payload)) {
                var domainID = req.payload.domainID;
                return new Promise((resolve, reject) => {
                    global.sqlite.run(`DELETE FROM Psw WHERE ID=('${domainID}')`, function (row) {
                        if (row.error)
                            reject(row.error);
                        else {
                            resolve(row);
                        }
                    });
                }).then((row) => {
                    return res.response(JSON.stringify("Deleted"));
                }).catch(function (err) {
                    console.log(err);
                    return res.response(JSON.stringify("An error occurred"));
                })
            }
            else {
                return res.response(JSON.stringify({ authenticated: false }));
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
                    domain: Joi.string().required(),
                    token: Joi.string().required()
                }
            }
        },
        handler: (req, res) => {
            if (global.isAuthenticated(req.query)) {
                const session = global.tokens[req.query.token].account;
                var domain = req.query.domain;
                return new Promise((resolve, reject) => {
                    global.sqlite.run(`SELECT * FROM Psw WHERE DOMAIN=('${domain}') AND USERID=('${session.id}')`, function (row) {
                        if (row.error)
                            reject(row.error);
                        else {
                            resolve(row);
                        }
                    });
                }).then((row) => {
                    if (row.length > 0) {
                        return decryptDom(session.id, row).then((decryptedRow) => {
                            return res.response(decryptedRow);
                        })
                    } else return res.response(JSON.stringify({ foundDomain: false }))
                }).catch(function (err) {
                    console.log(err);
                    return res.response(JSON.stringify("An error occurred"));
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