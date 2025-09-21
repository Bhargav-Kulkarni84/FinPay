const jwt = require('jsonwebtoken');

function authCheck(req, res, next) {

    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer")){
        return res.status(403).json({message:"Sign in first "});
    }
    
    let authToken = req.headers['authorization'];
    authToken = authToken.substring(7);
    // console.log(authToken);

    try {
        const decodedToken = jwt.verify(authToken,process.env.JWT_SECRET);
        // console.log(decodedToken);
        req.userId = decodedToken.userId;
        // console.log(req.userId);
        next();
    }

    catch (e) {
        return res.json({message:"Error"}).status(403);
    }

}

module.exports = authCheck;
