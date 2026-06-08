import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  vehicleNo: { type: String, required: true },
  description: { type: String, required: true },
  shopGarage: { type: String },
  
  // Change these to String or allow null to prevent "Empty String" date errors
  jobStartedDate: { type: String }, 
  jobCompletedDate: { type: String },
  invoiceDate: { type: String }, 
  
  invoiceNo: { type: String },
  driver: { type: String },
  amount: { type: Number, required: true },
  
  // Remove the strict 'enum' temporarily to see if it fixes the save error
  maintenanceType: { 
    type: String, 
    default: "Other"
  }, 
  paymentMethod: { type: String }
}, { timestamps: true });

// Always check if the model is already compiled to avoid "OverwriteModelError"
const Maintenance = mongoose.models.Maintenance || mongoose.model("Maintenance", maintenanceSchema);

export default Maintenance;