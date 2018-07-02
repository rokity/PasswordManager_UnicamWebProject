
module.exports = [
    {
        method: 'GET',
        path: '/api/login',
        handler: (req, res) => 
        {
            res.type = 'application/json';
            return res.response(JSON.stringify({id:"example-route"}))
        },
        options:{
            cors :true            
        }
      },
]