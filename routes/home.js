
module.exports = [
    {
        method: 'GET',
        path: '/home',
        config:{
            cors :true  ,          
        },
        handler: (req, res) => 
        {
            return res.response("ciao")
        },                      
    },
    {
        method: 'GET',
        path: '/login',
        config:{
            cors :true  ,          
        },
        handler: (req, res) => 
        {
            return res.response("login paage")
        },
    }
]