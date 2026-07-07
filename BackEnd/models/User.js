import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  department: { type: String, required: true } // NEW: Department link
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);