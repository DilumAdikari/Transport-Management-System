import Vehicle from "../models/Vehicle.js";

// --- GET ALL VEHICLES ---
export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: "Fetch Error: " + err.message });
  }
};

// --- AUTHORIZE NEW VEHICLE ---
export const createVehicle = async (req, res) => {
  try {
    const { 
      plateNumber, modelName, type, chassisNo, engineNo, 
      brand, serialNo, fuelType, yom, licenseValid,
      emissionValid, pricePerKM // ADDED: New fields from request body
    } = req.body;

    if (!plateNumber) {
      return res.status(400).json({ message: "Vehicle Plate Number is required." });
    }

    const vehicle = new Vehicle({
      plateNumber,
      modelName,
      type,
      chassisNo,
      engineNo,
      brand,
      serialNo,
      fuelType,
      yom,
      licenseValid,
      emissionValid, // ADDED: To save in DB
      pricePerKM: Number(pricePerKM) || 0 // ADDED: To save in DB as a number
    });

    const savedVehicle = await vehicle.save();
    res.status(201).json(savedVehicle);
  } catch (err) {
    res.status(400).json({ message: "Vehicle Authorization Failed: " + err.message });
  }
};

// --- DELETE VEHICLE ---
export const deleteVehicle = async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: "Vehicle Removed" });
  } catch (err) {
    res.status(500).json({ message: "Delete Failed: " + err.message });
  }
};