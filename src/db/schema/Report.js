import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  targetType: { type: String, enum: ["post", "comment", "user"], required: true, index: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  reason: { type: String, required: true, trim: true, maxlength: 120 },
  details: { type: String, trim: true, maxlength: 1000, default: "" },
  status: { type: String, enum: ["open", "reviewing", "resolved", "dismissed"], default: "open", index: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  resolutionNote: { type: String, maxlength: 1000, default: "" },
}, { timestamps: true });

ReportSchema.index({ reporter: 1, targetType: 1, targetId: 1 }, { unique: true });
ReportSchema.index({ status: 1, createdAt: -1 });

export const Report = mongoose.model("Report", ReportSchema);
