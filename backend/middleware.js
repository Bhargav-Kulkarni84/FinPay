const jwt = require('jsonwebtoken');

function authCheck(req, res, next) {

    // const authHeader = req.headers.authorization;

    // if(!authHeader || !authHeader.startsWith("Bearer")){
    //     return res.status(403).json({message:"Sign in first "});
    // }
    
    // let authToken = req.headers['authorization'];
    // authToken = authToken.substring(7);

    const authToken = req.cookies.authToken;

    
    if (!authToken) {
        return res.redirect('/api/v1/user/signin'); // not logged in
    }

    try {
        const decodedToken = jwt.verify(authToken,process.env.JWT_SECRET);
        req.userId = decodedToken.userId;
        next();
    }
    catch (e) {
        console.log(err);
        return res.json({message:"Error"}).status(403);
    }

}

module.exports = authCheck;
