import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true },
  modelName: { type: String },
  type: { type: String },
  chassisNo: { type: String },
  engineNo: { type: String },
  brand: { type: String },
  serialNo: { type: String },
  fuelType: { type: String },
  yom: { type: String },
  licenseValid: { type: String },
  emissionValid: { type: String }, // Emission date field
  pricePerKM: { type: Number, default: 0 },
  
  // 🎯 Manual typing text input field for Owner details
  owner: { type: String, default: "" },

  // 🎯 ADDED: Insurance Expiry Date Field to match the new frontend DatePicker
  insuranceValid: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("Vehicle", vehicleSchema);