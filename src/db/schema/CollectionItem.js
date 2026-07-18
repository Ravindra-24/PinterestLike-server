import mongoose from "mongoose";

const CollectionItemSchema = new mongoose.Schema({
  collection: { type: mongoose.Schema.Types.ObjectId, ref: "Collection", required: true, index: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

CollectionItemSchema.index({ collection: 1, post: 1 }, { unique: true });

export const CollectionItem = mongoose.model("CollectionItem", CollectionItemSchema);
