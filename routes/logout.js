
module.exports = [
    {
        method: ['GET'],
        path: '/api/logout',
        config: {
            cors: 
            {
                origin:['http://localhost:4200/'],
                credentials: true,
            },
            auth: { mode: 'required' },            
        },
        handler: (req,res) =>
        {

            res.response(JSON.stringify(req.state['sid-example'].sid));
        }
    }
]