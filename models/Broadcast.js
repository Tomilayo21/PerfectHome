import mongoose from "mongoose";

const BroadcastSchema = new mongoose.Schema(
  {
    subject: String,
    message: String,
    status: { type: String, default: "pending" },
    recipients: [
      {
        email: String,
        status: { type: String, enum: ["sent", "failed", "scheduled"], default: "scheduled" },
        error: String,
        sentAt: Date,
      },
    ],
    scheduledFor: Date,
    attachment: [
      {
        type: String, // URLs to uploaded files (images, PDFs, etc.)
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Broadcast || mongoose.model("Broadcast", BroadcastSchema);


// export default mongoose.models.Broadcast || mongoose.model("Broadcast", BroadcastSchema);
