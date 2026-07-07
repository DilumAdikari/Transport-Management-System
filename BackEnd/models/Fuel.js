import mongoose from "mongoose";

const fuelSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  vehicleNo: { type: String, required: true },
  fillingStation: { type: String },
  invoiceDate: { type: Date },
  driver: { type: String, required: true },
  meterReading: { type: Number },
  fuelType: { type: String },
  liters: { type: Number, required: true },
  costPerLiter: { type: Number, required: true },
  totalAmount: { type: Number, required: true } // Auto-calculated value
}, { timestamps: true });

export default mongoose.models.Fuel || mongoose.model("Fuel", fuelSchema);