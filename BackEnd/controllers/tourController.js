import Tour from "../models/Tour.js";
import Notification from "../models/Notification.js";

// --- GET TOURS (Filtered by Role & User) ---
export const getTours = async (req, res) => {
  const { role, name } = req.query;

  try {
    let query = {};
    // Only apply filter if the user is NOT an admin
    if (role !== "admin" && name) {
      query = { userName: name };
    }

    const tours = await Tour.find(query).sort({ createdAt: -1 });
    res.json(tours);
  } catch (err) {
    res.status(500).json({ message: "Fetch Error: " + err.message });
  }
};

// --- CREATE NEW TOUR (Notify Admin) ---
export const createTour = async (req, res) => {
  try {
    const count = await Tour.countDocuments();
    const formattedId = `TID${(count + 1).toString().padStart(6, '0')}`;
    const { fromLocation, toLocation, department, date, time, remark, userName } = req.body;

    if (!userName) {
        return res.status(400).json({ message: "User identification is required." });
    }

    const tour = new Tour({
      tourId: formattedId,
      fromLocation,
      toLocation,
      department,
      date,
      time,
      remark,
      userName,
      location: `${fromLocation} to ${toLocation}`,
      status: "Pending"
    });

    const savedTour = await tour.save();

    // NOTIFY ADMIN
    await new Notification({
      recipient: "admin", 
      message: `New Request: ${savedTour.tourId} from ${savedTour.department}`,
      tourId: savedTour.tourId
    }).save();

    res.status(201).json(savedTour);
  } catch (err) {
    res.status(400).json({ message: "Creation Failed: " + err.message });
  }
};

// --- ALLOCATE TOUR (Single Update - Notify User) ---
export const allocateTour = async (req, res) => {
  try {
    const { driver, vehicle } = req.body;
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      { status: "Allocated", driver, vehicle },
      { new: true }
    );

    if (!tour) return res.status(404).json({ message: "Tour not found" });

    // NOTIFY THE REQUESTING USER
    await new Notification({
      recipient: tour.userName,
      message: `Tour ${tour.tourId} Allotted! Driver: ${driver} | Unit: ${vehicle}`,
      tourId: tour.tourId
    }).save();

    res.json(tour);
  } catch (err) {
    res.status(500).json({ message: "Allocation Failed: " + err.message });
  }
};

// --- BATCH ALLOCATE (Bulk Update - Notify Users) ---
export const batchAllocate = async (req, res) => {
  const { tourIds, driver, vehicle, allocationRef } = req.body;
  try {
    // 1. Update the Tours
    await Tour.updateMany(
      { _id: { $in: tourIds } },
      { $set: { driver, vehicle, allocation_ref: allocationRef, status: "Allocated" } }
    );

    // 2. Fetch affected tours to notify owners
    const affectedTours = await Tour.find({ _id: { $in: tourIds } });

    // 3. Create bulk notifications
    const notifications = affectedTours.map(tour => ({
      recipient: tour.userName,
      message: `Tour ${tour.tourId} Allotted! Driver: ${driver} | Unit: ${vehicle}`,
      tourId: tour.tourId,
      isRead: false
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json({ message: `Successfully allocated ${tourIds.length} tours and notified users.` });
  } catch (err) {
    res.status(500).json({ message: "Batch Allocation Failed: " + err.message });
  }
};

// --- UPDATE METERS ---
export const updateMeters = async (req, res) => {
  const { allocationRef, startMeter, endMeter } = req.body;
  try {
    await Tour.updateMany(
      { allocation_ref: allocationRef },
      { $set: { startMeter, endMeter } }
    );
    res.json({ message: "Meter readings updated" });
  } catch (err) {
    res.status(500).json({ message: "Meter update failed: " + err.message });
  }
};