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
      emissionValid, pricePerKM, owner,
      insuranceValid // 🎯 FIXED: req.body එකෙන් එන අලුත් insurance date එක මෙතනට බාරගන්නවා
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
      emissionValid,
      pricePerKM: Number(pricePerKM) || 0,
      owner,
      insuranceValid // 🎯 FIXED: Database එකේ සේව් වෙන්න මෙතනට insuranceValid pass කරනවා
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