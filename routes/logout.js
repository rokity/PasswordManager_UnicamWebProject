const Joi = require('joi');

module.exports = [
    {
        method: ['GET'],
        path: '/api/logout',
        config: {
            cors: true,
            validate: {
                query: {
                    token: Joi.string().required(),
                }
            },
            response: {
                failAction: async (req, res, err) => { console.error("error", err); res.response({ error: err }) },
                status: {
                    200: Joi.object(
                        {
                            removed: Joi.boolean().required(),
                        })
                }
            }
        },
        handler: (req, res) => {
            if (global.isAuthenticated(req.query)) {
                delete global.tokens[req.query.token]
                return res.response(JSON.stringify({ removed: true }));
            }
            else
                return res.response(JSON.stringify({ removed: false }));
        }
    }
]