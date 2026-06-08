import mongoose from "mongoose";

const tourSchema = new mongoose.Schema(
  {
    tourId: { type: String, unique: true, required: true },
    fromLocation: { type: String, required: true },
    toLocation: { type: String, required: true },
    department: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String }, 
    remark: String,
    userName: String,
    status: { 
      type: String, 
      default: "Pending" 
    },
    driver: String,
    vehicle: String,

    // --- NEW BATCH ALLOCATION FIELDS ---
    
    // This ID will be shared by all tours in the same batch
    allocation_ref: { 
      type: String, 
      default: null 
    }, 
    
    // Meter readings for the specific batch/trip
    startMeter: { 
      type: Number, 
      default: 0 
    },
    
    endMeter: { 
      type: Number, 
      default: 0 
    }
  },
  { timestamps: true }
);

// Added a check to prevent recompilation errors during development
const Tour = mongoose.models.Tour || mongoose.model("Tour", tourSchema);

export default Tour;