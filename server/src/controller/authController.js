import User from '../model/userModel.js'
import jwt from 'jsonwebtoken'
import {validationResult} from 'express-validator'

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    })
}


//POST api/auth/login
const Login = async(req,res,next)=> {
    const error = validationResult(req)

    if(!error.isEmpty()){
        return res.status(401).json({error: 'Invalid Credentials'})
    }

    try {
        const {email,password} = req.body
        const user = await User.findOne({email}).select('+password')

        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid Password or Email'})
        }

        const token = generateToken(user._id)

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                socialLinks: user.socialLinks
            }
        })
    } catch (error) {
        res.status(500).json({error: 'Server error during login'})
    }
}

//GET api/auth/me
const Profile = async (req,res) => {
    res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      bio: req.user.bio,
      socialLinks: req.user.socialLinks
    }
  });
}

//PUT api/auth/profile
const updateProfile = async(req,res) => {
    try {
        const {name , bio , socialLinks , avatar} = req.body
        const id = req.user._id
        const update = {}

        if(name) update.name = name
        if(bio !== undefined) update.bio = bio
        if(socialLinks) update.socialLinks = socialLinks
        if(avatar) update.avatar = avatar

        const user = await User.findByIdAndUpdate(id,update ,{new : true})

        res.json({user})
    } catch (error) {
        res.status(500).json({error: 'Error updating profile'})
    }
}


//
export {
    Login,
    Profile,
    updateProfile,
}