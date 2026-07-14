import React, { useState, useEffect } from "react";
import API from "../api";
import { toast } from "sonner";
import { 
  Fuel as FuelIcon, 
  CalendarDays, 
  Truck, 
  User, 
  Gauge, 
  Droplets, 
  Banknote, 
  PlusCircle, 
  X, 
  Loader2,
  Store,
  Edit3,   
  Trash2,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ListOrdered
} from "lucide-react";

// --- MUI & DATE PICKER IMPORTS ---
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Autocomplete, TextField, createTheme, ThemeProvider, MenuItem, Select } from '@mui/material';
import dayjs from 'dayjs';

const muiTheme = createTheme({
  palette: {
    primary: { main: '#eab308' }, 
    text: { primary: '#334155' }, 
  },
  typography: {
    fontFamily: 'sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          boxShadow: 'none',
          border: '1px solid #e2e8f0',
          marginTop: '4px'
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '0.6rem',
          height: '40px',
          backgroundColor: '#f8fafc',
          boxShadow: 'none',
          '& fieldset': { borderColor: '#e2e8f0' },
          '&:hover fieldset': { borderColor: '#cbd5e1' },
          '&.Mui-focused fieldset': { borderWidth: '1px', borderColor: '#eab308' },
        },
        input: {
          padding: '8px 12px !important',
          fontSize: '0.85rem',
          fontWeight: 500,
        }
      }
    }
  }
});

export default function FuelManagement() {
  const initialForm = {
    vehicleNo: "",
    fillingStation: "",
    driver: "",
    meterReading: "",
    fuelType: "Auto Diesel",
    liters: "",
    costPerLiter: "",
    totalAmount: 0
  };

  const [formData, setFormData] = useState(initialForm);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredTours] = useState([]); // State for search filtration
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); 

  // --- NEW: Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(10); 

  // --- NEW: Filter States ---
  const [vehicleFilter, setVehicleFilter] = useState("All Vehicles");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const themeFont = 'sans-serif';

  // Auto-calc Total
  useEffect(() => {
    const total = (parseFloat(formData.liters || 0) * parseFloat(formData.costPerLiter || 0)).toFixed(2);
    setFormData(prev => ({ ...prev, totalAmount: total }));
  }, [formData.liters, formData.costPerLiter]);

  useEffect(() => { fetchInitialData(); }, []);

  // --- NEW: Live Filtering Sync Module ---
  useEffect(() => {
    let data = logs;
    if (vehicleFilter !== "All Vehicles") {
      data = data.filter(log => log.vehicleNo === vehicleFilter);
    }
    if (dateFrom) {
      data = data.filter(log => dayjs(log.date).isAfter(dateFrom.subtract(1, 'day')));
    }
    if (dateTo) {
      data = data.filter(log => dayjs(log.date).isBefore(dateTo.add(1, 'day')));
    }
    setFilteredTours(data);
    setCurrentPage(1); // Reset to page 1 on filter trigger
  }, [vehicleFilter, dateFrom, dateTo, logs]);

  const fetchInitialData = async () => {
    try {
      const [vRes, dRes, fRes] = await Promise.all([
        API.get("/vehicles").catch(() => ({ data: [] })),
        API.get("/drivers").catch(() => ({ data: [] })),
        API.get("/fuel").catch(() => ({ data: [] }))
      ]);
      setVehicles(vRes.data || []);
      setDrivers(dRes.data || []);
      setLogs(fRes.data || []);
      setFilteredTours(fRes.data || []);
    } catch (err) { 
      toast.error("Database sync error"); 
    } finally { 
      setFetching(false); 
    }
  };

  const handleResetFilters = () => {
    setVehicleFilter("All Vehicles");
    setDateFrom(null);
    setDateTo(null);
    setCurrentPage(1);
  };

  const handleEditTrigger = (log) => {
    setEditingId(log._id);
    setFormData({
      vehicleNo: log.vehicleNo || "",
      fillingStation: log.fillingStation || "",
      driver: log.driver || "",
      meterReading: log.meterReading || "",
      fuelType: log.fuelType || "Auto Diesel",
      liters: log.liters || "",
      costPerLiter: log.costPerLiter || "",
      totalAmount: log.totalAmount || 0
    });
    setSelectedDate(dayjs(log.date));
    setShowModal(true);
  };

  const handleDeleteLog = (id) => {
    toast("Delete Fuel Record?", {
      description: "Are you sure you want to permanently remove this record?",
      duration: Infinity, 
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await API.delete(`/fuel/${id}`);
            toast.success("Fuel record removed successfully");
            fetchInitialData();
          } catch (err) {
            toast.error("Failed to delete record");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => toast.dismiss(),
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await API.put(`/fuel/${editingId}`, {
          ...formData,
          date: selectedDate.format('YYYY-MM-DD')
        });
        toast.success("Fuel record updated!");
      } else {
        await API.post("/fuel", {
          ...formData,
          date: selectedDate.format('YYYY-MM-DD')
        });
        toast.success("Fuel record saved!");
      }
      handleCloseModal();
      fetchInitialData();
    } catch (err) { 
      toast.error("Failed to save record"); 
    } finally {
        setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(initialForm);
    setSelectedDate(dayjs());
  };

  // --- NEW: Pagination Math Slicing ---
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  if (fetching) return (
    <div className="h-screen flex items-center justify-center font-medium text-slate-400 bg-[#F8FAFC]" style={{ fontFamily: themeFont }}>
        <Loader2 className="animate-spin mr-2 text-yellow-500"/> Synchronizing...
    </div>
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <div className="space-y-6 animate-in fade-in duration-700 p-4" style={{ fontFamily: themeFont }}>
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2.5xl font-medium text-slate-800 tracking-tight flex items-center gap-3">
               <FuelIcon className="text-yellow-600" size={28} /> Fuel Tracking
            </h2>
            <div className="h-8 w-px bg-slate-200 hidden md:block" />
            <p className="text-slate-400 font-medium text-xs tracking-wide hidden md:block">
              {filteredLogs.length} Total Records
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200/70">
            <div className="flex items-center gap-2 px-2">
                <ListOrdered size={14} className="text-slate-400" />
                <p className="text-xs font-medium text-slate-500 tracking-tight">Show rows:</p>
                <Select
                    size="small"
                    value={logsPerPage}
                    onChange={(e) => { setLogsPerPage(e.target.value); setCurrentPage(1); }}
                    sx={{ height: '32px', minWidth: '80px', fontSize: '12px', fontWeight: '500', borderRadius: '10px', bgcolor: '#f8fafc', border: 'none', '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                >
                    {[10, 20, 50, 100].map(val => (
                        <MenuItem key={val} value={val} sx={{ fontSize: '12px', fontWeight: '500' }}>{val}</MenuItem>
                    ))}
                </Select>
            </div>

            <button 
                onClick={() => { setEditingId(null); setShowModal(true); }} 
                className="bg-slate-900 text-yellow-400 h-9 px-5 rounded-xl font-medium text-xs tracking-wide flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 whitespace-nowrap"
            >
              <PlusCircle size={16} /> Add Fuel Entry
            </button>
          </div>
        </header>

        {/* 🎯 NEW ADDITION: Clean Flat Filtering Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-[2rem] border border-slate-200/60 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="label-style">Filter vehicle unit</label>
            <Autocomplete 
              size="small" 
              options={["All Vehicles", ...vehicles.map(v => v.plateNumber)]} 
              value={vehicleFilter} 
              onChange={(e, val) => setVehicleFilter(val || "All Vehicles")} 
              renderInput={(params) => <TextField {...params} placeholder="Choose vehicle..." />} 
            />
          </div>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="flex flex-col gap-1.5">
              <label className="label-style">From date range</label>
              <DatePicker value={dateFrom} onChange={(v) => setDateFrom(v)} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label-style">To date range</label>
              <DatePicker value={dateTo} onChange={(v) => setDateTo(v)} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
            </div>
          </LocalizationProvider>

          <button onClick={handleResetFilters} className="h-10 bg-slate-100 text-slate-600 rounded-xl font-medium text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
            <RotateCcw size={14}/> Reset filters
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[2rem] border border-slate-200/60 overflow-hidden font-medium">
          <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200/70 text-xs font-medium text-slate-400">
                  <tr>
                    <th className="px-6 py-5">Date</th>
                    <th className="px-6 py-5">Vehicle</th>
                    <th className="px-6 py-5">Driver</th>
                    <th className="px-6 py-5 text-center">Liters</th>
                    <th className="px-6 py-5 text-right">Total (LKR)</th>
                    <th className="px-6 py-5 text-center">Actions</th> 
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {currentLogs.map(log => (
                  <tr key={log._id} className="hover:bg-yellow-50/40 transition-colors">
                      <td className="px-6 py-5 text-sm text-slate-600 font-medium">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="px-6 py-5">
                          <span className="bg-slate-900 text-yellow-400 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wider">{log.vehicleNo}</span>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-700 font-medium italic">{log.driver}</td>
                      <td className="px-6 py-5 text-sm text-slate-500 font-medium text-center">{log.liters} L</td>
                      <td className="px-6 py-5 text-lg font-medium text-slate-900 text-right">
                          {Number(log.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => handleEditTrigger(log)}
                            className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
                            title="Edit Record"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteLog(log._id)}
                            className="p-2 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                            title="Delete Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                  </tr>
                  ))}
              </tbody>
              </table>
          </div>

          {/* 🎯 NEW ADDITION: Beautiful Smooth Flat Pagination Interface */}
          <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex justify-between items-center">
            <p className="text-xs font-medium text-slate-400">Page {currentPage} of {totalPages || 1}</p>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all"><ChevronLeft size={16}/></button>
              <div className="px-4 flex items-center bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900">Records {indexOfFirstLog + 1} - {Math.min(indexOfLastLog, filteredLogs.length)}</div>
              <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>

        {/* POPUP MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] p-10 relative overflow-y-auto max-h-[95vh] custom-scrollbar border border-slate-200 animate-in zoom-in-95 duration-300">
              
              <button onClick={handleCloseModal} className="absolute top-6 right-8 text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={28}/>
              </button>

              <h2 className="text-2xl font-medium tracking-tight mb-1 text-slate-900">
                {editingId ? "Edit fuel entry" : "New fuel entry"}
              </h2>
              <p className="text-sm text-slate-500 mb-8 font-medium">Log filling station details and amounts.</p>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex flex-col gap-2">
                  <label className="label-style">Date</label>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker value={selectedDate} onChange={(v) => setSelectedDate(v)} slotProps={{ textField: { fullWidth: true } }} />
                  </LocalizationProvider>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label-style">Vehicle unit</label>
                  <Autocomplete
                    options={vehicles.map(v => v.plateNumber)}
                    value={formData.vehicleNo}
                    onChange={(e, val) => setFormData({...formData, vehicleNo: val})}
                    renderInput={(params) => <TextField {...params} placeholder="Select vehicle" />}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label-style">Driver personnel</label>
                  <Autocomplete
                    options={drivers.map(d => d.name)}
                    value={formData.driver}
                    onChange={(e, val) => setFormData({...formData, driver: val})}
                    renderInput={(params) => <TextField {...params} placeholder="Select driver" />}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label-style">Filling station name</label>
                  <input className="input-style-clean" placeholder="e.g. Medagampitiya" value={formData.fillingStation} onChange={e => setFormData({...formData, fillingStation: e.target.value})}/>
                </div>

                <div className="flex flex-col gap-2">
                   <label className="label-style">Fuel category type</label>
                   <Autocomplete
                    options={["Auto Diesel", "Super Diesel", "Petrol 92", "Petrol 95"]}
                    value={formData.fuelType}
                    onChange={(e, val) => setFormData({...formData, fuelType: val})}
                    renderInput={(params) => <TextField {...params} placeholder="Select fuel type" />}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label-style">Current meter reading</label>
                  <input className="input-style-clean" type="number" placeholder="Odometer" value={formData.meterReading} onChange={e => setFormData({...formData, meterReading: e.target.value})}/>
                </div>
                
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mt-2 items-end">
                  <div className="flex flex-col gap-2">
                    <label className="label-style">Liters</label>
                    <input className="input-style-clean" type="number" step="0.01" value={formData.liters} onChange={e => setFormData({...formData, liters: e.target.value})} required/>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="label-style">Cost per liter</label>
                    <input className="input-style-clean" type="number" step="0.01" value={formData.costPerLiter} onChange={e => setFormData({...formData, costPerLiter: e.target.value})} required/>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="label-style">Total amount (LKR)</label>
                    <div className="h-12 flex items-center justify-center bg-slate-900 text-yellow-400 rounded-xl font-medium text-2xl border border-slate-800">
                      {formData.totalAmount}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-4 pt-4">
                  <button type="button" onClick={handleCloseModal} className="flex-1 py-4 border border-slate-200 rounded-xl font-medium text-xs text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-[2] py-4 bg-slate-900 text-yellow-400 rounded-xl font-medium text-xs tracking-wide hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50">
                      {loading ? "Saving entries..." : editingId ? "Update fuel entry" : "Confirm & save entry"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .label-style { font-size: 11px; font-weight: 500; text-transform: none; letter-spacing: normal; color: #94a3b8; margin-left: 2px; }
        .input-style-clean { 
          width: 100%; height: 40px; padding: 8px 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.6rem; outline: none; transition: all 0.2s; font-weight: 500; font-size: 0.85rem; color: #334155; font-family: sans-serif !important;
        }
        .input-style-clean:focus { background-color: #fff; border-color: #eab308; }
      `}} />
    </ThemeProvider>
  );
}