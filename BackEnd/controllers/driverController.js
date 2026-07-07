import Driver from "../models/Driver.js";
import Notification from "../models/Notification.js"; // IMPORT THIS
import dayjs from "dayjs"; // IMPORT THIS

// --- GET ALL DRIVERS ---
export const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: "Fetch Error: " + err.message });
  }
};

// --- REGISTER NEW DRIVER ---
export const createDriver = async (req, res) => {
  try {
    const { name, phone, licenseNo, licenseExpire, allowedTypes } = req.body;

    // 1. Manual Validation
    if (!name || name.trim() === "" || !phone || phone.trim() === "") {
      return res.status(400).json({ message: "Name and Phone are strictly required." });
    }

    // 2. Create the instance
    const driver = new Driver({
      name,
      phone,
      licenseNo: licenseNo || "", 
      licenseExpire: licenseExpire || "", 
      allowedTypes: allowedTypes || ""
    });

    // 3. Save to MongoDB
    const savedDriver = await driver.save();

    // --- 4. INSTANT NOTIFICATION LOGIC ---
    // Check if the newly registered driver expires exactly 7 days from today
    const targetDate = dayjs().add(7, 'day').format('YYYY-MM-DD');

    if (licenseExpire === targetDate) {
      const msg = `CRITICAL: Driver ${name}'s license is expiring on ${licenseExpire}!`;
      
      // Use 'admin' or your specific login username
      const adminUsername = "admin"; 

      // Create the notification record immediately
      await Notification.create({
        recipient: adminUsername,
        message: msg,
        isRead: false
      });
      
      console.log(`✨ Instant Alert: Notification generated for new driver: ${name}`);
    }

    res.status(201).json(savedDriver);

  } catch (err) {
    console.error("--- MONGODB REGISTRATION ERROR ---");
    console.error(err.message); 
    
    res.status(400).json({ 
      message: "Database Error: " + err.message 
    });
  }
};

// --- DELETE DRIVER ---
export const deleteDriver = async (req, res) => {
  try {
    const deleted = await Driver.findByIdAndDelete(req.params.id);
    if (!deleted) {
        return res.status(404).json({ message: "Driver not found" });
    }
    res.json({ message: "Driver Removed Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete Failed: " + err.message });
  }
};