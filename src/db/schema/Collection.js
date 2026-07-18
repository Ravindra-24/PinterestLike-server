import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 60 },
  slug: { type: String, required: true, trim: true },
  description: { type: String, trim: true, maxlength: 500, default: "" },
  visibility: { type: String, enum: ["public", "private"], default: "private", index: true },
  coverPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
  itemCount: { type: Number, default: 0, min: 0 },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

CollectionSchema.index({ owner: 1, slug: 1 }, { unique: true });
CollectionSchema.index({ visibility: 1, updatedAt: -1 });

export const Collection = mongoose.model("Collection", CollectionSchema);
