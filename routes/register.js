var bcrypt = require('bcrypt');

module.exports = [
    {
        method: 'POST',
        path: '/api/register',
        config: {
            cors: true,
            auth: { mode: 'optional' },            
        },
        handler: (req, res) => {
            console.log("ahsbdajsd")
            var name = req.payload.name;
            var surname = req.payload.surname;
            var email = req.payload.email;
            var masterkey = req.payload.masterkey;
            return bcrypt.genSalt(10).then((salt) => {
                return bcrypt.hash(masterkey, salt).then((value) => {
                    return new Promise((resolve,reject)=>
                    {
                        global.sqlite.run(`SELECT COUNT(*) as counter FROM User WHERE EMAIL='${email}'`, function (count){
                            if(!count.error){
                            if (count[0].counter>0){
                                reject({mailUtilizzata: true});
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
                        console.log("insert done with id", val)
                        var rows = global.sqlite.run(`SELECT * FROM User WHERE ID=${val}`);
                        console.log("row created", rows);
                        return res.response(JSON.stringify("Registration done"))
                    }).catch(function(err){
                        if (err.mailUtilizzata==true){
                            return res.response(JSON.stringify("Mail already used"));
                        } else throw err;
                    })                
                })
            })
        }
    }
]

