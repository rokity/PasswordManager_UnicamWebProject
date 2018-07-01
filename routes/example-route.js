
module.exports = [
    {
        method: 'GET',
        path: '/api/example-route',
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