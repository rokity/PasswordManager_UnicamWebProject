var forge = require('node-forge');


module.exports = [
    {
        method: ['POST'],
        path: '/api/domain/add',
        config: {
            cors: true,
            auth: { mode: 'required' },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } },
        },
        handler: (req, res) => {
            if (req.auth.isAuthenticated) {
                const session = req.auth.credentials;
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
        },

    },

    {
        method: ['GET'],
        path: '/api/domain/getall',
        config: {
            cors: true,
            auth: { mode: 'required' },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } },
        },
        handler: (req, res) => {
            if (req.auth.isAuthenticated) {
                const session = req.auth.credentials;
                return new Promise((resolve, reject) => {
                    global.sqlite.run(`SELECT ID, DOMAIN, PASSWORD, CREATED, MODIFIED FROM Psw WHERE USERID=('${session.id}')`, function (list) {
                        if (list.error)
                            reject(list.error);
                        else {
                            resolve(list);
                        }
                    });;
                }).then((list) => {
                    if (list.length > 0) {
                        return decryptDom(session.id, list).then((clearlist) => {
                            return res.response(clearlist);
                        })
                    } else return res.response(JSON.stringify("No domain insert in"));
                }).catch(function (err) {
                    console.log(err);
                    return res.response(JSON.stringify("An error occurred"));
                })
            }
        }
    },

    {
        method: ['PUT'],
        path: '/api/domain/modify',
        config: {
            cors: true,
            auth: { mode: 'required' },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } },
        },
        handler: (req, res) => {
            if (req.auth.isAuthenticated) {
                const session = req.auth.credentials;
                var domainID = req.payload.domainID;
                var updatedPsw = req.payload.updatedPsw;
                return new Promise((resolve, reject) => {
                    return encryptDom(session.id, updatedPsw).then((encrypted) => {
                    global.sqlite.run(`UPDATE Psw SET PASSWORD='${encrypted}', MODIFIED=DATETIME('now') WHERE ID=('${domainID}')`, function (row) {
                        if (row.error)
                            reject(row.error);
                        else {
                            resolve(row);
                        }
                    });
                })}).then((row) => {
                     return res.response(JSON.stringify("Updated"));
                }).catch(function (err) {
                    console.log(err);
                    return res.response(JSON.stringify("An error occurred"));
                })
            }
        }
    },
    {
        method: ['DELETE'],
        path: '/api/domain/delete',
        config: {
            cors: true,
            auth: { mode: 'required' },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } },
        },
        handler: (req, res) => {
            if (req.auth.isAuthenticated) {
                const session = req.auth.credentials;
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