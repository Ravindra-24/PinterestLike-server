import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["follow", "like", "comment", "save", "moderation"], required: true },
  entityType: { type: String, enum: ["post", "comment", "user", "collection"], required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  readAt: { type: Date, default: null },
}, { timestamps: true });

NotificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", NotificationSchema);
