import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  licenseNo: { type: String, default: "" },      
  licenseExpire: { type: String, default: "" },  
  allowedTypes: { type: String, default: "" }    
}, { timestamps: true });

// Prevents re-compilation errors
const Driver = mongoose.models.Driver || mongoose.model("Driver", driverSchema);
export default Driver;