import jwt from 'jsonwebtoken'
import User from '../model/userModel.js'

const protect = async(req,res, next)=> {
    try {
        let token 

        if(req.headers.authorization?.startsWith('Bearer ')){
            token = req.headers.authorization.split(' ')[1]
        }

        if(!token){
            return res.status(401).json({error: 'Not Authorized . No Token Provided'})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id)

        if(!user){
            return res.status(401).json({error: 'User not found'})
        }

        req.user = user
        next()
    } catch (error) {
        if(error.name === "TokenExpiredError"){
            return res.status(401).json({error: 'Token Expired. Please Login Again'})
        }

        return res.status(401).json({error: 'Invalid Token'})
    }
}


export  {protect}