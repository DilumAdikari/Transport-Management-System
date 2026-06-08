import express from "express";
import { 
    getTours, 
    createTour, 
    allocateTour, 
    batchAllocate,    // Ensure this is imported if used for bulk allocation
    updateMeters      // Ensure this is imported for odometer updates
} from "../controllers/tourController.js";

const router = express.Router();

// --- STANDARD ROUTES ---

// @route   GET /api/tours
// @desc    Get all tours (Filtered by user in controller if not admin)
router.get("/", getTours);

// @route   POST /api/tours
// @desc    Create a new tour & Notify Admin
router.post("/", createTour);

// @route   PUT /api/tours/:id
// @desc    Allocate driver/vehicle to a specific tour & Notify User
router.put("/:id", allocateTour);


// --- BATCH & UTILITY ROUTES ---

// @route   PUT /api/tours/batch-allocate
// @desc    Bulk allocation for multiple tours
router.put("/batch-allocate", batchAllocate);

// @route   PUT /api/tours/update-meters
// @desc    Update start/end mileage
router.put("/update-meters", updateMeters);

export default router;