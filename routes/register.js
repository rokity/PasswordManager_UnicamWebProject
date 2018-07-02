var bcrypt = require('bcrypt');

const saltRounds = 10;

module.exports = [
    {
        method: 'POST',
        path: '/api/register',
        handler: (req, res) => {
            var name = req.payload.name;
            var surname = req.payload.surname;
            var email = req.payload.email;
            var masterkey = req.payload.masterkey;
            return hashing(masterkey).then((value) => {
                return new Promise((resolve,reject)=>
                {
                    global.sqlite.run(`INSERT INTO User (NAME, SURNAME, EMAIL, MASTERKEY) VALUES ('${name}', '${surname}', '${email}', '${value}')`, function (row) {
                        if (row.error)
                            reject(row.error)
                        else {
                            resolve(row);
                        }
                    });;
                }).then((val) => {
                    console.log("insert done with id", val)
                    var rows = global.sqlite.run(`SELECT * FROM User WHERE ID=${val}`);
                    console.log("row created", rows);
                    return res.response(JSON.stringify("Good Job"))
                }).catch(function(err){
                    throw err;
                })                
            })
        },
        options: {
            cors: true
        }
    }
]


let hashing = (myPlaintextPassword) => {
    var p = new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(myPlaintextPassword, salt, function (err, hash) {
                resolve(hash + salt);
            });
        });
    })
    return p;
}
