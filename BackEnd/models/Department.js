import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, uppercase: true }, // e.g., HR, IT, PROD
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Department", DepartmentSchema);