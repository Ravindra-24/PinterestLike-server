import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    title : {
        type:String,
        required:true,
    },
    description : {
        type:String,
        required:false,
    },
    image : {
        type:String,
        required:true,
    },
    slug: {
        type: String,
        trim: true,
        index: true,
    },
    altText: {
        type: String,
        trim: true,
        maxlength: 240,
    },
    category: {
        type: String,
        trim: true,
        default: "Inspiration",
        index: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    visibility: {
        type: String,
        enum: ["public", "private"],
        default: "public",
        index: true,
    },
    status: {
        type: String,
        enum: ["published", "hidden", "deleted"],
        default: "published",
        index: true,
    },
    media: {
        url: String,
        publicId: String,
        width: Number,
        height: Number,
        aspectRatio: Number,
        dominantColor: String,
    },
    likeCount: { type: Number, default: 0, min: 0 },
    commentCount: { type: Number, default: 0, min: 0 },
    saveCount: { type: Number, default: 0, min: 0 },
    engagementScore: { type: Number, default: 0, index: true },
    deletedAt: { type: Date, default: null },
    likes : [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }],
    comments : [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment',
    }],
    user : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }
},{
    timestamps:true,
})

PostSchema.index({ status: 1, visibility: 1, createdAt: -1, _id: -1 });
PostSchema.index({ user: 1, status: 1, createdAt: -1 });
PostSchema.index({ status: 1, visibility: 1, engagementScore: -1, createdAt: -1 });
PostSchema.index({ title: "text", description: "text", tags: "text" });

export const Post = mongoose.model('Post',PostSchema);
