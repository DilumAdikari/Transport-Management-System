import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import dayjs from "dayjs";
import mongoose from "mongoose";

// Models
import User from "./models/User.js"; 
import Tour from "./models/Tour.js"; 
import Maintenance from "./models/Maintenance.js"; 
import Fuel from "./models/Fuel.js";
import Notification from "./models/Notification.js";
import Department from "./models/Department.js"; 
import Vehicle from "./models/Vehicle.js"; 
import Driver from "./models/Driver.js";   

// Routes
import tourRoutes from "./routes/tourRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";

dotenv.config();
connectDB();

// --- GHOST INDEX CLEANUP (Fixes Duplicate Key Error) ---
mongoose.connection.once('open', async () => {
  try {
    const collections = await mongoose.connection.db.listCollections({ name: 'drivers' }).toArray();
    if (collections.length > 0) {
      // Drops the old 'licenseNumber' unique index that was causing crashes
      await mongoose.connection.db.collection('drivers').dropIndex('licenseNumber_1').catch(() => {});
      console.log("✅ Ghost Index Cleanup: licenseNumber index removed (if it existed)");
    }
  } catch (err) {
    console.log("Cleanup note: licenseNumber index already gone.");
  }
});

const app = express();

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());

// --- 1. USER MANAGEMENT ROUTES ---

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    
    // --- 🔐 HARDCODED ADMIN BYPASS LOGIC ---
    if (username === "admin" && password === "123") {
      const token = jwt.sign(
        { id: "hardcoded_admin_id_2026", role: "admin" },
        process.env.JWT_SECRET || "tms_secret_2026",
        { expiresIn: "1d" }
      );

      console.log("⚡ Hardcoded Admin Bypass Entry Authorized");
      
      return res.json({
        token,
        user: { 
          id: "hardcoded_admin_id_2026", 
          name: "System Administrator", 
          role: "admin", 
          username: "admin",
          department: "IT DEPARTMENT" // Custom default department assignment for testing
        }
      });
    }
    // ----------------------------------------

    // Standard Database Login Flow (If credentials do not match the override rule)
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Username not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "tms_secret_2026",
      { expiresIn: "1d" }
    );

    // CRITICAL: Returning department so frontend can auto-fill and lock it
    res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role, 
        username: user.username,
        department: user.department // Added for auto-selection
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Login Error: " + err.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, username, password, role, department } = req.body;
    
    // Check if username exists
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
        name, 
        username, 
        password: hashedPassword, 
        role,
        department // Added for department allocation
    });
    
    await newUser.save();
    res.status(201).json({ message: "User created successfully with department: " + department });
  } catch (err) {
    res.status(400).json({ message: "User registration failed: " + err.message });
  }
});

app.put("/api/users/change-password/:id", async (req, res) => {
  try {
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Update failed: " + err.message });
  }
});

// --- 2. DEPARTMENT MANAGEMENT ---

app.get("/api/departments", async (req, res) => {
  try {
    const depts = await Department.find().sort({ name: 1 });
    res.json(depts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/departments", async (req, res) => {
  try {
    const newDept = new Department(req.body);
    await newDept.save();
    res.status(201).json(newDept);
  } catch (err) {
    res.status(400).json({ message: "Creation failed: " + err.message });
  }
});

app.delete("/api/departments/:id", async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 3. MASTER DATABASE UPDATE ROUTES (FOR SETTINGS PAGE) ---

app.put("/api/vehicles/:id", async (req, res) => {
  try {
    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Vehicle update failed: " + err.message });
  }
});

app.put("/api/drivers/:id", async (req, res) => {
  try {
    const updated = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Driver update failed: " + err.message });
  }
});

// --- 4. BATCH ALLOCATION & NOTIFICATION LOGIC ---

app.put("/api/tours/batch-allocate", async (req, res) => {
  const { tourIds, driver, vehicle, allocationRef } = req.body;
  try {
    // 🎯 අලුත් Logic එක: Frontend එකෙන් දැනටමත් Ref එකක් එවනවා නම් එයම පාවිච්චි කරයි, නැත්නම් අලුත් එකක් හදයි
    const batchRef = allocationRef || `TRIP-${Math.floor(100000 + Math.random() * 900000)}`;

    await Tour.updateMany(
      { _id: { $in: tourIds } },
      { $set: { driver, vehicle, allocation_ref: batchRef, status: "Allocated" } }
    );

    const affectedTours = await Tour.find({ _id: { $in: tourIds } });

    const notifications = affectedTours.map(tour => ({
      recipient: tour.userName,
      message: `Your Tour ${tour.tourId} has been Allotted. Driver: ${driver} | Unit: ${vehicle}`,
      tourId: tour.tourId,
      isRead: false
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json({ message: `Successfully allocated ${tourIds.length} tours under reference: ${batchRef}` });
  } catch (err) {
    res.status(500).json({ message: "Batch Allocation Failed: " + err.message });
  }
});

app.put("/api/tours/update-meters", async (req, res) => {
  // 🎯 Debugging සඳහා ලොග් එකක් දාමු
  console.log("📥 Received Update Request:", req.body); 
  
  const { allocationRef, startMeter, endMeter, status } = req.body;
  
  try {
    // 🎯 Update වෙන රෙකෝඩ්ස් ප්‍රමාණය බලාගන්න result එක අල්ලගමු
    const result = await Tour.updateMany(
      { allocation_ref: allocationRef },
      { $set: { 
          startMeter: Number(startMeter), 
          endMeter: Number(endMeter), 
          status: status || "Completed" 
        } 
      }
    );

    console.log("✅ Update Result:", result); // මේකෙන් පේනවා Tour කීයක් Update වුණාද කියලා

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "No tours found with this Batch Reference" });
    }

    res.json({ message: "Meter readings and status updated successfully", result });
  } catch (err) {
    console.error("❌ Update Error:", err);
    res.status(500).json({ message: "Meter update failed: " + err.message });
  }
});

// --- 5. MAINTENANCE, FUEL & NOTIFICATIONS ---

app.post("/api/maintenance", async (req, res) => {
  try {
    const newMaintenance = new Maintenance(req.body);
    await newMaintenance.save();
    res.status(201).json({ message: "Log saved" });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

app.get("/api/maintenance", async (req, res) => {
  try {
    const logs = await Maintenance.find().sort({ date: -1 });
    res.json(logs || []);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post("/api/fuel", async (req, res) => {
  try {
    const newFuel = new Fuel(req.body);
    await newFuel.save();
    res.status(201).json({ message: "Fuel record saved" });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

app.get("/api/fuel", async (req, res) => {
  try {
    const fuelLogs = await Fuel.find().sort({ date: -1 });
    res.json(fuelLogs || []);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 🎯 ADDED: UPDATE (EDIT) FUEL RECORD ROUTE
app.put("/api/fuel/:id", async (req, res) => {
  try {
    const updatedFuel = await Fuel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedFuel);
  } catch (err) {
    res.status(400).json({ message: "Fuel record update failed: " + err.message });
  }
});

// 🎯 ADDED: DELETE FUEL RECORD ROUTE
app.delete("/api/fuel/:id", async (req, res) => {
  try {
    await Fuel.findByIdAndDelete(req.params.id);
    res.json({ message: "Fuel record deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Fuel record deletion failed: " + err.message });
  }
});

app.get("/api/notifications/:username", async (req, res) => {
  try {
    const notes = await Notification.find({ recipient: req.params.username })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put("/api/notifications/read/:username", async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.params.username, isRead: false }, 
      { $set: { isRead: true } }
    );
    res.json({ message: "Marked as read" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- 6. LICENSE EXPIRY AUTOMATION ---

const checkLicenseExpirations = async () => {
  try {
    const drivers = await Driver.find();
    const today = dayjs();
    const alertDate = today.add(7, 'day').format('YYYY-MM-DD');

    for (const driver of drivers) {
      if (driver.licenseExpire === alertDate) {
        const msg = `CRITICAL: Driver ${driver.name}'s license is expiring on ${driver.licenseExpire}!`;
        // Ensure recipient matches the correct admin username
        const existingNote = await Notification.findOne({ recipient: 'admin', message: msg });

        if (!existingNote) {
          await Notification.create({
            recipient: 'admin',
            message: msg,
            isRead: false
          });
        }
      }
    }
  } catch (err) { console.error("Expiry automation error:", err); }
};

setInterval(checkLicenseExpirations, 24 * 60 * 60 * 1000);
checkLicenseExpirations();

// --- 7. MODULAR ROUTES ---
app.use("/api/tours", tourRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/vehicles", vehicleRoutes);

app.get("/", (req, res) => res.send("TMS API Active"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));