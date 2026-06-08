import express from "express";
import { getDrivers, createDriver, deleteDriver } from "../controllers/driverController.js";

const router = express.Router();

router.get("/", getDrivers);
router.post("/", createDriver);
router.delete("/:id", deleteDriver);

export default router;