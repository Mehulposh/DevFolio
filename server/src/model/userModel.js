import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxLength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        maxLength: [8, 'Password cannot exceed 8 characters'],
        select: false
    },
    role:{
        type: String,
        enum: ['admin'],
        default: 'admin'
    },
    avatar:{
        type: String,
        default: ''
    },
    bio: String,
    socialLinks: {
        github: String,
        linkedin: String,
        twitter: String,
        website: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


//Hash password before saving
UserSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next()
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})


//Compare a password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model('User', UserSchema)