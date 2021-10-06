const jwt = require('jsonwebtoken');

//middleware: verifies the token of user during get request
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'] // authorization header in get req
    const token = authHeader && authHeader.split(' ')[1] //if authHeader not null return the token
    if (token == null) return res.sendStatus(401)
    // verifies the token using sectret token and returns user info if match
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, data) => {
        if (err) {
            res.status(403).json({ err: 'Invalid token' })
        } else {
            next(); // ends middle ware moves onto route handler
        }
    })
}

module.exports = authenticateToken