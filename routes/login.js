
var uuid = 1;
module.exports = [
    {
        method: ['POST'],
        path: '/api/login',
        config: {
            cors: true,
            auth: { mode: 'try' },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } },
        },
        handler: (req, res) => {
            

        },
    },
]