const jwt = require('jsonwebtoken');
const responseUtils = require('./responseUtils');

const checkAuth = (req, res, next) => {
    // Get the JWT token from the request headers
 
    console.log(req.headers.authorization, "teeeeeeeeeeeee")
    const token = req.headers.authorization?.split(' ')[0];
    //const token = req.headers.authorization?.split(' ')[1];
    console.log(token, "teeeeeeeeeeeeetoken")
    // If the token is missing or invalid, send a 401 Unauthorized response
    if (!token) {
        responseUtils.response401(res, 'Missing or invalid token');
        //res.status(401).json({ error: 'Missing or invalid token' });
        return;
    }

    // Verify the token using the secret key
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
        responseUtils.response401(res, 'Invalid token');
        //res.status(401).json({ error: 'Invalid token' });
        return;
        }

        // Add the decoded token to the request object and continue to the next middleware
        req.decoded = decoded;
        //console.log(req.decoded);
        //const username = decoded.userId; //if you want to get the user id
        next();
    });
};

module.exports = checkAuth;