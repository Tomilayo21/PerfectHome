import mongoose from "mongoose";

const VisitorLogSchema = new mongoose.Schema(
  {
    ip: String,
    path: String,
    userAgent: String,
    event: { type: String, enum: ["page_view", "button_click", "visit"] },
  },
  { timestamps: true }
);

export default mongoose.models.VisitorLog ||
  mongoose.model("VisitorLog", VisitorLogSchema);
