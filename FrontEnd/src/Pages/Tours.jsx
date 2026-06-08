import { useEffect, useState } from "react";
import API from "../api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  ClipboardList,
  Loader2,
  X,
  ShieldCheck,
  CheckSquare,
  Square,
  Layers,
  Gauge,
  Save,
  ArrowRight,
  AlertCircle,
  User as UserIcon,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ListOrdered,
  Eye,
  MapPin,
  Clock,
  Info,
  MessageSquare,
} from "lucide-react";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Autocomplete,
  TextField,
  createTheme,
  ThemeProvider,
  MenuItem,
  Select,
} from "@mui/material";
import dayjs from "dayjs";

const muiTheme = createTheme({
  palette: { primary: { main: "#eab308" }, text: { primary: "#334155" } },
  typography: { fontFamily: '"Inter", "Open Sans", sans-serif' },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "1rem",
          marginTop: "4px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
          border: "1px solid #f1f5f9",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "0.6rem",
          height: "40px",
          backgroundColor: "#f8fafc",
          "& fieldset": { borderColor: "#e2e8f0" },
          "&.Mui-focused fieldset": { borderWidth: "1px" },
        },
        input: {
          padding: "8px 12px !important",
          fontSize: "0.75rem",
          fontWeight: 500,
        },
      },
    },
  },
});

export default function Tours({ user, refresh }) {
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [departments, setDepartments] = useState([]); // NEW: State for DB departments
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [toursPerPage, setToursPerPage] = useState(10);

  const [searchId, setSearchId] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const [selectedTours, setSelectedTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [viewTour, setViewTour] = useState(null);
  const [meterModal, setMeterModal] = useState(null);
  const [allocationData, setAllocationData] = useState({
    driver: "",
    vehicle: "",
  });
  const [meterData, setMeterData] = useState({ startMeter: "", endMeter: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = user?.role === "admin";
  const themeFont = '"Inter", "Open Sans", "Segoe UI", system-ui, sans-serif';

  const loadData = async () => {
    try {
      const [toursRes, driversRes, vehiclesRes, deptsRes] = await Promise.all([
        API.get("/tours"),
        API.get("/drivers"),
        API.get("/vehicles"),
        API.get("/departments"), // NEW: Fetching from DB
      ]);
      const accessibleData = isAdmin
        ? toursRes.data
        : toursRes.data.filter((t) => t.userName === user?.name);
      setTours(accessibleData);
      setFilteredTours(accessibleData);
      setDrivers(driversRes.data || []);
      setVehicles(vehiclesRes.data || []);
      setDepartments(deptsRes.data || []); // SET DEPARTMENTS FROM DB
    } catch (error) {
      toast.error("Data Sync Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReset = () => {
    setSearchId("");
    setDeptFilter("All Departments");
    setStatusFilter("All Status");
    setDateFrom(null);
    setDateTo(null);
    setCurrentPage(1);
  };

  useEffect(() => {
    let data = tours;
    if (searchId)
      data = data.filter((t) =>
        t.tourId.toLowerCase().includes(searchId.toLowerCase()),
      );
    if (deptFilter !== "All Departments")
      data = data.filter((t) => t.department === deptFilter);
    if (statusFilter !== "All Status")
      data = data.filter((t) => t.status === statusFilter);
    if (dateFrom)
      data = data.filter((t) =>
        dayjs(t.date).isAfter(dateFrom.subtract(1, "day")),
      );
    if (dateTo)
      data = data.filter((t) => dayjs(t.date).isBefore(dateTo.add(1, "day")));

    setFilteredTours(data);
    setCurrentPage(1);
  }, [searchId, deptFilter, statusFilter, dateFrom, dateTo, tours]);

  const toggleSelection = (id) => {
    setSelectedTours((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const indexOfLastTour = currentPage * toursPerPage;
  const indexOfFirstTour = indexOfLastTour - toursPerPage;
  const currentTours = filteredTours.slice(indexOfFirstTour, indexOfLastTour);
  const totalPages = Math.ceil(filteredTours.length / toursPerPage);

  const handleBatchAllocate = async () => {
    if (!isAdmin) return toast.error("Unauthorized");
    setActionLoading(true);
    const batchRef = `TRIP-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      await API.put("/tours/batch-allocate", {
        tourIds: selectedTours.length > 0 ? selectedTours : [selectedTour._id],
        driver: allocationData.driver,
        vehicle: allocationData.vehicle,
        allocationRef: batchRef,
      });
      toast.success("Allocation Successful");
      loadData();
      if (refresh) refresh();
      setSelectedTour(null);
      setSelectedTours([]);
    } catch (error) {
      toast.error("Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateMeters = async () => {
    if (!isAdmin) return;
    setActionLoading(true);
    try {
      await API.put("/tours/update-meters", {
        allocationRef: meterModal.ref,
        startMeter: Number(meterData.startMeter),
        endMeter: Number(meterData.endMeter),
      });
      toast.success("Mileage Updated");
      loadData();
      if (refresh) refresh();
      setMeterModal(null);
    } catch (error) {
      toast.error("Update Failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center">
        <Loader2 className="animate-spin inline text-yellow-600" size={40} />
      </div>
    );

  return (
    <ThemeProvider theme={muiTheme}>
      <div
        className="space-y-6 animate-in fade-in duration-700 p-4"
        style={{ fontFamily: themeFont }}
      >
        <header className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
              <ClipboardList className="text-yellow-600" size={28} /> Fleet
              Tours
            </h2>
            <div className="h-8 w-px bg-slate-200 hidden md:block" />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest hidden md:block">
              {filteredTours.length} Total Records
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 px-2">
              <ListOrdered size={14} className="text-slate-400" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                Show Rows:
              </p>
              <Select
                size="small"
                value={toursPerPage}
                onChange={(e) => {
                  setToursPerPage(e.target.value);
                  setCurrentPage(1);
                }}
                sx={{
                  height: "32px",
                  minWidth: "80px",
                  fontSize: "11px",
                  fontWeight: "900",
                  borderRadius: "10px",
                  bgcolor: "#f8fafc",
                  border: "none",
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              >
                {[10, 20, 50, 100].map((val) => (
                  <MenuItem
                    key={val}
                    value={val}
                    sx={{ fontSize: "11px", fontWeight: "bold" }}
                  >
                    {val}
                  </MenuItem>
                ))}
              </Select>
            </div>

            {isAdmin && selectedTours.length > 0 && (
              <button
                onClick={() => setSelectedTour({ isBatch: true })}
                className="bg-slate-900 text-yellow-400 h-8 px-4 rounded-xl font-bold text-[10px] uppercase shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-all"
              >
                <Layers size={14} /> Assign {selectedTours.length}
              </button>
            )}
          </div>
        </header>

        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="label-style">Tour ID</label>
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-slate-400"
                size={14}
              />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Search..."
                className="input-style-compact pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label-style">Dept.</label>
            <Autocomplete
              size="small"
              options={["All Departments", ...departments.map((d) => d.name)]}
              value={deptFilter}
              onChange={(e, val) => setDeptFilter(val || "All Departments")}
              renderInput={(params) => <TextField {...params} />}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label-style">Status</label>
            <Autocomplete
              size="small"
              options={["All Status", "Pending", "Allocated"]}
              value={statusFilter}
              onChange={(e, val) => setStatusFilter(val || "All Status")}
              renderInput={(params) => <TextField {...params} />}
            />
          </div>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="flex flex-col gap-1.5">
              <label className="label-style">From</label>
              <DatePicker
                value={dateFrom}
                onChange={(v) => setDateFrom(v)}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label-style">To</label>
              <DatePicker
                value={dateTo}
                onChange={(v) => setDateTo(v)}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </div>
          </LocalizationProvider>
          <button
            onClick={handleReset}
            className="h-10 bg-slate-100 text-slate-500 rounded-xl font-bold text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden font-medium">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-5 w-10 text-center">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          const selectable = filteredTours.filter(
                            (t) => t.status !== "Allocated",
                          );
                          if (selectedTours.length === selectable.length)
                            setSelectedTours([]);
                          else setSelectedTours(selectable.map((t) => t._id));
                        }}
                      >
                        <Square size={18} />
                      </button>
                    )}
                  </th>
                  <th className="px-6 py-5">Tour ID</th>
                  <th className="px-6 py-5">Batch Ref</th>
                  <th className="px-6 py-5">Route</th>
                  <th className="px-6 py-5 text-indigo-600">Distance</th>
                  <th className="px-6 py-5">Driver</th>
                  <th className="px-6 py-5">Vehicle</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentTours.map((t) => (
                  <tr
                    key={t._id}
                    onClick={() => setViewTour(t)}
                    className="group transition-all hover:bg-slate-50/50 cursor-pointer"
                  >
                    <td
                      className="px-6 py-5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isAdmin && t.status !== "Allocated" ? (
                        <button onClick={() => toggleSelection(t._id)}>
                          {selectedTours.includes(t._id) ? (
                            <CheckSquare
                              className="text-yellow-600"
                              size={18}
                            />
                          ) : (
                            <Square className="text-slate-200" size={18} />
                          )}
                        </button>
                      ) : (
                        <ShieldCheck
                          className={`mx-auto ${t.status === "Allocated" ? "text-emerald-500" : "text-slate-200"}`}
                          size={18}
                        />
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-slate-900 text-yellow-400 text-[11px] font-bold px-3.5 py-1.5 rounded-lg tracking-wider">
                        {t.tourId}
                      </span>
                    </td>
                    <td
                      className="px-6 py-5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t.allocation_ref ? (
                        isAdmin ? (
                          <button
                            onClick={() => {
                              setMeterModal({ ref: t.allocation_ref });
                              setMeterData({
                                startMeter: t.startMeter || "",
                                endMeter: t.endMeter || "",
                              });
                            }}
                            className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded text-[10px] font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                          >
                            <Gauge size={12} /> {t.allocation_ref}
                          </button>
                        ) : (
                          <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded text-[10px] font-bold border border-slate-100 flex items-center gap-1">
                            <Gauge size={12} /> {t.allocation_ref}
                          </span>
                        )
                      ) : (
                        <span className="text-[9px] text-slate-300 uppercase">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-slate-700 font-semibold">
                        {t.fromLocation} → {t.toLocation}
                      </p>
                      <p className="text-[9px] text-slate-400 uppercase italic">
                        {t.department} | {t.userName}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      {t.startMeter > 0 && t.endMeter > 0 ? (
                        <div className="flex flex-col">
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-black border border-indigo-100 w-fit">
                            {t.endMeter - t.startMeter} KM
                          </span>
                          <span className="text-[8px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                            {t.startMeter}-{t.endMeter}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-200 text-[10px]">--</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-700 italic">
                      {t.driver || "—"}
                    </td>
                    <td className="px-6 py-5 text-[11px] font-bold text-slate-600 uppercase">
                      {t.vehicle || "—"}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${t.status === "Allocated" ? "bg-emerald-50 text-emerald-600" : "bg-yellow-50 text-yellow-700"}`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td
                      className="px-6 py-5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t.status !== "Allocated" && isAdmin ? (
                        <button
                          onClick={() => setSelectedTour(t)}
                          className="bg-yellow-400 text-slate-900 px-4 py-1.5 rounded-lg font-bold text-[10px] uppercase shadow-md hover:bg-yellow-500"
                        >
                          Allocate
                        </button>
                      ) : (
                        <span className="text-slate-300 text-[10px] italic">
                          Locked
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex justify-between items-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Page {currentPage} of {totalPages || 1}
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="px-4 flex items-center bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-900 uppercase">
                Records {indexOfFirstTour + 1} -{" "}
                {Math.min(indexOfLastTour, filteredTours.length)}
              </div>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* TOUR DETAILS MODAL */}
        <AnimatePresence>
          {viewTour && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setViewTour(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <div className="bg-slate-900 p-8 flex justify-between items-center">
                  <div>
                    <h3 className="text-yellow-400 font-black text-xl uppercase tracking-tighter flex items-center gap-2">
                      <Info size={20} /> Tour Details
                    </h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                      Ref: {viewTour.tourId}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewTour(null)}
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-xl text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <MapPin size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 font-black uppercase">
                        Complete Route
                      </p>
                      <p className="text-slate-900 font-black text-lg">
                        {viewTour.fromLocation}{" "}
                        <span className="text-blue-500">→</span>{" "}
                        {viewTour.toLocation}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-slate-300" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">
                          Requested Date
                        </p>
                        <p className="text-sm font-bold text-slate-700">
                          {viewTour.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-slate-300" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">
                          Scheduled Time
                        </p>
                        <p className="text-sm font-bold text-slate-700">
                          {viewTour.time}
                        </p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-3xl">
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">
                        Assigned Driver
                      </p>
                      <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                        <UserIcon size={14} className="text-blue-500" />{" "}
                        {viewTour.driver || "Unallocated"}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">
                        Vehicle Plate
                      </p>
                      <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                        <Truck size={14} className="text-blue-500" />{" "}
                        {viewTour.vehicle || "Not Set"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 font-black uppercase flex items-center gap-2">
                      <MessageSquare size={14} className="text-yellow-500" />{" "}
                      Special Remarks
                    </p>
                    <div className="bg-yellow-50/50 border border-yellow-100 p-4 rounded-2xl">
                      <p className="text-slate-700 text-sm font-medium italic">
                        {viewTour.remark ||
                          "No additional remarks provided for this tour request."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex justify-center">
                  <button
                    onClick={() => setViewTour(null)}
                    className="px-10 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:shadow-xl active:scale-95 transition-all"
                  >
                    Dismiss Details
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ALLOCATION MODAL */}
        <AnimatePresence>
          {isAdmin && selectedTour && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedTour(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 border border-white"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-slate-900 uppercase">
                    Allocation
                  </h3>
                  <button
                    onClick={() => setSelectedTour(null)}
                    className="p-1.5 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-900 hover:text-white transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label className="label-style">Driver</label>
                    <Autocomplete
                      size="small"
                      options={drivers.map((d) => d.name)}
                      value={allocationData.driver}
                      onChange={(e, val) =>
                        setAllocationData({
                          ...allocationData,
                          driver: val || "",
                        })
                      }
                      renderInput={(p) => (
                        <TextField {...p} placeholder="Search Personnel..." />
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="label-style">Vehicle</label>
                    <Autocomplete
                      size="small"
                      options={vehicles.map((v) => v.plateNumber)}
                      value={allocationData.vehicle}
                      onChange={(e, val) =>
                        setAllocationData({
                          ...allocationData,
                          vehicle: val || "",
                        })
                      }
                      renderInput={(p) => (
                        <TextField {...p} placeholder="Choose Unit..." />
                      )}
                    />
                  </div>
                  <button
                    onClick={handleBatchAllocate}
                    disabled={actionLoading}
                    className="w-full mt-4 py-4 bg-slate-900 text-yellow-400 rounded-xl font-bold uppercase text-[11px] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                  >
                    {actionLoading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <ShieldCheck size={18} />
                    )}{" "}
                    Confirm
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MILEAGE MODAL */}
        <AnimatePresence>
          {isAdmin && meterModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMeterModal(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-white"
              >
                <div className="bg-slate-900 p-8 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                        Odometer Update
                      </p>
                      <h3 className="text-2xl font-bold uppercase">
                        {meterModal.ref}
                      </h3>
                    </div>
                    <button
                      onClick={() => setMeterModal(null)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-2">
                      <label className="label-style flex items-center gap-2">
                        <Gauge size={12} className="text-slate-400" /> Start
                        Reading
                      </label>
                      <input
                        className="input-style-compact text-center text-lg font-bold !h-14"
                        type="number"
                        value={meterData.startMeter}
                        onChange={(e) =>
                          setMeterData({
                            ...meterData,
                            startMeter: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label-style flex items-center gap-2">
                        <ArrowRight size={12} className="text-slate-400" /> End
                        Reading
                      </label>
                      <input
                        className={`input-style-compact text-center text-lg font-bold !h-14`}
                        type="number"
                        value={meterData.endMeter}
                        onChange={(e) =>
                          setMeterData({
                            ...meterData,
                            endMeter: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div
                    className={`rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 border border-slate-100`}
                  >
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Total Travelled Distance
                    </p>
                    <h4 className="text-4xl font-black text-slate-900">
                      {Math.max(
                        0,
                        Number(meterData.endMeter) -
                          Number(meterData.startMeter),
                      )}
                      <span className="text-sm font-bold text-slate-400 ml-2">
                        KM
                      </span>
                    </h4>
                  </div>
                  <button
                    onClick={handleUpdateMeters}
                    disabled={actionLoading || !meterData.endMeter}
                    className={`w-full py-5 rounded-2xl font-bold uppercase text-[11px] tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${!meterData.endMeter ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
                  >
                    {actionLoading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}{" "}
                    Save Records
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .label-style { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-left: 2px; }
        .input-style-compact { width: 100%; height: 40px; padding: 8px 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.6rem; outline: none; transition: all 0.2s; font-weight: 500; font-size: 0.75rem; color: #334155; }
        .input-style-compact:focus { background-color: #fff; border-color: #eab308; }
      `,
        }}
      />
    </ThemeProvider>
  );
}
