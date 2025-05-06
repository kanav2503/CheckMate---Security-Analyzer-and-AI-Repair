const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
    try{
        const token = req.header("x-auth-token")
        if(!token){
            return res.status(401).json({msg: "Access Denied"})
        }
        if(token == 'null'){
            return res.status(401).json({msg: "Access Denied"})
        }
    const verified = jwt.verify(token, "passwordKey");
    if(!verified) return res.status(401).json({msg: "auth denied"});
    req.user = verified.id;
    req.token = token;
    next();
    }
    catch(e){
        res.status(500).json({error: e.message});
    }
}

module.exports = auth;