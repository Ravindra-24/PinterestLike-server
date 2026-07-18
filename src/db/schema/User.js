import mongoose from "mongoose";
import { hashPassword } from "../../utils/auth.utils.js";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: false,
        default:null,
    },
    email: {
        type: String,
        required: true,
        unique:true,
    },
    username: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        sparse: true,
        index: true,
    },
    displayName: {
        type: String,
        trim: true,
        maxlength: 80,
    },
    bio:{
        type:String,
        required:false,
        default:null,
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        required: false,
        default:null,
    },
    phone: {
        type: String,
        required: false,
        default:null,
    },
    role:{
        type:Number,
        default:0,
        // 0: normal user
        // 1: moderator
        // 2 admin
    },
    disabled:{
        type:Boolean,
        default:false,
    },
    lastLogin:{
        type:Date,
        required:false,
    },
    followers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }],
    following:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }],
    posts : [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post',
    }],
    comments : [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment',
    }],
    tokens : [{
        type:String,
    }],
    refreshSessions: [{
        tokenHash: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        userAgent: { type: String, maxlength: 300 },
        createdAt: { type: Date, default: Date.now },
    }],
    interests: [{ type: String, trim: true }],
    followerCount: { type: Number, default: 0, min: 0 },
    followingCount: { type: Number, default: 0, min: 0 },
    postCount: { type: Number, default: 0, min: 0 },
    deletedAt: { type: Date, default: null },
}, {
    timestamps:true,
})

userSchema.virtual('fullName').get(function(){
    return `${this.firstName} ${this.lastName}`
})

userSchema.virtual('initials').get(function(){
    return `${this.firstName?.[0] || ''}${this.lastName?.[0] || ''}`
})

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
    const hashedPassword =await hashPassword(this.password)
    this.password = hashedPassword
    next()
})

userSchema.statics.exists = async function(id){
    try {
        const user = await this.findOne({_id:id})
    if(user) throw new Error('User already exists')
    return user
    } catch (error) {
        throw error
    }
}

userSchema.statics.findByEmail = async function(email){
    try {
        const user = await this.findOne({email})
    if(user) throw new Error('User already exists')
    return true
    } catch (error) {
        throw error
    }
}

userSchema.index({ disabled: 1, deletedAt: 1 });

export const User = mongoose.model('User', userSchema)
