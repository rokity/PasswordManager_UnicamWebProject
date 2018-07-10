
module.exports = [
    {
        method: ['GET'],
        path: '/api/logout',
        config: {
            cors: true,          
        },
        handler: (req,res) =>
        {
            if(global.isAuthenticated(req.query))
                {
                    delete global.tokens[req.query.token]
                    return res.response(JSON.stringify({removed:true}));
                }
            else
            return res.response(JSON.stringify({removed:false}));
        }
    }
]