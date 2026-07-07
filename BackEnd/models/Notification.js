import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  recipient: { type: String, required: true }, // Username of the person receiving it
  message: { type: String, required: true },
  tourId: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Notification", NotificationSchema);