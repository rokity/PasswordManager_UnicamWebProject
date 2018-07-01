
module.exports = [
    {
        method: 'GET',
        path: '/api/example-route',
        handler: (req, res) => 
        {
            res.type = 'application/json';
            return res.response(JSON.stringify({id:"testa di cazzo"}))
            
        },
        options:{
            cors :true            
        }
      },
]