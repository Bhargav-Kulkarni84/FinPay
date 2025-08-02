const jwt = require('jsonwebtoken');

function authCheck(req, res, next) {

    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer")){
        return res.status(403).json({message:"Error"});
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
        return res.json({message:"Error"}.status(403));
    }

}

module.exports = authCheck;

/*authCheck/

{"token": "eyJhbGciOiJIUzI1NiJ9.Njg3ZTZjNTMyNGE5OTcxOTE1YWI4MjUz.2a1JV-SS51fU6Y_9PCeina_NULAn_ikZzoNPCFvAMwQ"}
{"token": "eyJhbGciOiJIUzI1NiJ9.Njg3ZTZjNTMyNGE5OTcxOTE1YWI4MjUz.2a1JV-SS51fU6Y_9PCeina_NULAn_ikZzoNPCFvAMwQ"}
*/