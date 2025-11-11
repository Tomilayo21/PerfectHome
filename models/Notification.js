// // models/Notification.js
// import mongoose from "mongoose";

// const NotificationSchema = new mongoose.Schema({
//   type: { type: String, required: true }, // e.g., 'review', 'order'
//   message: { type: String, required: true },
//   link: { type: String }, // optional: e.g., link to the review page
//   isRead: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);








































// models/Notification.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'order', 'review', etc.
    message: { type: String, required: true },
    relatedId: { type: String }, // link reference (orderId, reviewId, etc.)
    link: { type: String }, // optional: for direct navigation
    isRead: { type: Boolean, default: false },
    externalId: { type: String, unique: true }, // to avoid duplicates (e.g. 'order-123')
  },
  { timestamps: true } // adds createdAt, updatedAt
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
