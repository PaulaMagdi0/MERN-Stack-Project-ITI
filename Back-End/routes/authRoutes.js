const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticationToken=(req , res , next)=>{
    const authHeader=req.headers["authorization"];
    const token= authHeader && authHeader.split(" ")[1];
    
    if(token== null){
        return res.status(401).json({message:"Authentication token required"})
    }
    jwt.verify(token, process.env.JWT_SECRET , (err , user)=>{
        if(err){
            return res.status(403).json({ message: "Token expired, please login again!" });
        }
        req.user = user;
        return next();
    })
}
module.exports={authenticationToken};