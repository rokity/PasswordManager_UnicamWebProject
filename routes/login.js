var bcrypt = require('bcrypt');

module.exports = [
    {
        method: 'POST',
        path: '/api/login',
        handler: (req, res) => 
        {
            var email = req.payload.email;
            var masterkey = req.payload.masterkey;
            return new Promise((resolve,reject)=>
                    {
                        global.sqlite.run(`SELECT MASTERKEY as key FROM User WHERE EMAIL=('${email}')`, function (result) {
                            if (result.error)
                                reject(result.error);
                            else {
                                resolve(result[0].key);
                            }
                        });;
                    }).then((val) => {
                        return bcrypt.compare(masterkey, val).then((value) => {
                            if(value) return res.response(JSON.stringify("Logged"));
                            else return res.response(JSON.stringify("Wrong Username or password"))
                        });
                    }).catch(function(err){
                        throw err;
                    })  
        },
        options:{
            cors :true            
        }
      },
]