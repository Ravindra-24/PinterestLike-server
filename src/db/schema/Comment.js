import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    commentText : {
        type:String,
        required:true,
    },
    user : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    post : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post',
    },
    likes : [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }],
    likeCount: { type: Number, default: 0, min: 0 },
    status: {
        type: String,
        enum: ["published", "hidden", "deleted"],
        default: "published",
        index: true,
    },
    deletedAt: { type: Date, default: null },
},{
    timestamps:true,
})

export const Comment = mongoose.model('Comment',CommentSchema);
