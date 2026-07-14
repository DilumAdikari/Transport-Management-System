import React, { useState, useEffect } from "react";
import API from "../api";
import { toast } from "sonner";
import { 
  Wrench, CalendarDays, Truck, FileText, Store, 
  User, Banknote, CreditCard, PlusCircle, Loader2, X, Sparkles,
  Search, RotateCcw, ChevronLeft, ChevronRight, ListOrdered
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

export default function AddMaintenance() {
  const initialForm = {
    vehicleNo: "",
    description: "",
    shopGarage: "",
    driver: "",
    amount: "",
    maintenanceType: "Corrective",
    paymentMethod: ""
  };

  const [formData, setFormData] = useState(initialForm);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [fetching, setFetching] = useState(true);

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(10); 

  // --- Filter States ---
  const [vehicleFilter, setVehicleFilter] = useState("All Vehicles");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const themeFont = 'sans-serif';

  useEffect(() => { fetchInitialData(); }, []);

  // --- Live Filters Sync Module ---
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
    setFilteredLogs(data);
    setCurrentPage(1); 
  }, [vehicleFilter, dateFrom, dateTo, logs]);

  const fetchInitialData = async () => {
    try {
      const [vRes, dRes, mRes] = await Promise.all([
        API.get("/vehicles").catch(() => ({ data: [] })),
        API.get("/drivers").catch(() => ({ data: [] })),
        API.get("/maintenance").catch(() => ({ data: [] }))
      ]);
      setVehicles(vRes.data || []);
      setDrivers(dRes.data || []);
      setLogs(mRes.data || []);
      setFilteredLogs(mRes.data || []);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/maintenance", {
        ...formData,
        date: selectedDate.format('YYYY-MM-DD')
      });
      toast.success("Maintenance Record Saved!");
      setFormData(initialForm);
      setSelectedDate(dayjs());
      setShowModal(false);
      fetchInitialData();
    } catch (err) {
      toast.error("Error saving record");
    } finally {
      setLoading(false);
    }
  };

  // --- Pagination Math Slicing ---
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  if (fetching) return (
    <div className="h-screen flex items-center justify-center font-medium text-slate-400 bg-[#F8FAFC]" style={{ fontFamily: themeFont }}>
      <Loader2 className="animate-spin text-yellow-500 mr-2" /> Synchronizing...
    </div>
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <div className="space-y-6 animate-in fade-in duration-700 p-4" style={{ fontFamily: themeFont }}>
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2.5xl font-medium text-slate-800 tracking-tight flex items-center gap-3">
              <Wrench className="text-yellow-600" size={28} /> Maintenance Logs
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

            <button onClick={() => setShowModal(true)} className="bg-slate-900 text-yellow-400 h-9 px-5 rounded-xl font-medium text-xs tracking-wide flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 whitespace-nowrap">
              <PlusCircle size={16} /> Add New Record
            </button>
          </div>
        </header>

        {/* NEW ADDITION: Clean Flat Filtering Panel */}
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
                  <th className="px-6 py-5">Description</th>
                  <th className="px-6 py-5">Driver</th>
                  <th className="px-6 py-5 text-right">Amount (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-yellow-50/40 transition-colors">
                    <td className="px-6 py-5 text-sm text-slate-600 font-medium">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="px-6 py-5">
                      <span className="bg-slate-900 text-yellow-400 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wider">{log.vehicleNo}</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-800 font-medium">{log.description}</td>
                    <td className="px-6 py-5 text-sm text-slate-700 italic font-medium">{log.driver}</td>
                    <td className="px-6 py-5 text-lg font-medium text-slate-900 text-right">{Number(log.amount)?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* NEW ADDITION: Flat Pagination Interface */}
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
            <div className="bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-[2.5rem] p-10 relative custom-scrollbar border border-slate-200 animate-in zoom-in-95 duration-300">
              
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-8 text-slate-400 hover:text-slate-900 transition-colors"><X size={28} /></button>

              <h2 className="text-2xl font-medium tracking-tight mb-1 text-slate-900">Add service record</h2>
              <p className="text-sm text-slate-500 mb-8 font-medium">Please enter maintenance details accurately.</p>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex flex-col gap-2">
                  <label className="label-style">Service date</label>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker value={selectedDate} onChange={(v) => setSelectedDate(v)} slotProps={{ textField: { fullWidth: true } }} />
                  </LocalizationProvider>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label-style">Vehicle plate unit</label>
                  <Autocomplete
                    options={vehicles.map(v => v.plateNumber)}
                    value={formData.vehicleNo}
                    onChange={(e, val) => setFormData({...formData, vehicleNo: val})}
                    renderInput={(params) => <TextField {...params} placeholder="Select vehicle" />}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label-style">Responsible driver</label>
                  <Autocomplete
                    options={drivers.map(d => d.name)}
                    value={formData.driver}
                    onChange={(e, val) => setFormData({...formData, driver: val})}
                    renderInput={(params) => <TextField {...params} placeholder="Select driver" />}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label-style">Maintenance category</label>
                  <Autocomplete
                    options={["Preventive", "Corrective", "Tire", "Breakdown", "Other"]}
                    value={formData.maintenanceType}
                    onChange={(e, val) => setFormData({...formData, maintenanceType: val})}
                    renderInput={(params) => <TextField {...params} placeholder="Select type" />}
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="label-style">Work description details</label>
                  <input className="input-style-clean" type="text" placeholder="Repair details..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label-style">Garage / shop name</label>
                  <input className="input-style-clean" type="text" value={formData.shopGarage} onChange={(e) => setFormData({...formData, shopGarage: e.target.value})} />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label-style">Service cost amount (LKR)</label>
                  <input className="input-style-clean" type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                </div>

                <div className="md:col-span-2 flex gap-4 mt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 border border-slate-200 rounded-xl font-medium text-xs text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-[2] py-4 bg-slate-900 text-yellow-400 rounded-xl font-medium text-xs tracking-wide hover:bg-slate-800 disabled:opacity-50 transition-all">
                    {loading ? "Processing entries..." : "Confirm & save entry"}
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