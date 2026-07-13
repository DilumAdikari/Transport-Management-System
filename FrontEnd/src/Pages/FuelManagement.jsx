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
  Trash2   
} from "lucide-react";

// --- MUI & DATE PICKER IMPORTS ---
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Autocomplete, TextField, createTheme, ThemeProvider } from '@mui/material';
import dayjs from 'dayjs';

const muiTheme = createTheme({
  palette: {
    primary: { main: '#eab308' }, 
    text: { primary: '#1e293b' }, 
  },
  typography: {
    fontFamily: '"Inter", "Open Sans", sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          height: '48px',
          backgroundColor: '#f8fafc',
          '& fieldset': { borderColor: '#e2e8f0' },
          '&:hover fieldset': { borderColor: '#cbd5e1' },
          '&.Mui-focused fieldset': { borderWidth: '1px' },
        },
        input: {
          padding: '12px !important',
          fontSize: '0.8rem',
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
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); 

  const themeFont = '"Inter", "Open Sans", "Segoe UI", system-ui, sans-serif';

  // Auto-calc Total
  useEffect(() => {
    const total = (parseFloat(formData.liters || 0) * parseFloat(formData.costPerLiter || 0)).toFixed(2);
    setFormData(prev => ({ ...prev, totalAmount: total }));
  }, [formData.liters, formData.costPerLiter]);

  useEffect(() => { fetchInitialData(); }, []);

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
    } catch (err) { 
      toast.error("Database sync error"); 
    } finally { 
      setFetching(false); 
    }
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

  const handleDeleteLog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this fuel record?")) return;
    try {
      await API.delete(`/fuel/${id}`);
      toast.success("Fuel record removed");
      fetchInitialData();
    } catch (err) {
      toast.error("Failed to delete record");
    }
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

  if (fetching) return (
    <div className="h-screen flex items-center justify-center font-medium text-slate-400 bg-[#F8FAFC]">
        <Loader2 className="animate-spin mr-2 text-yellow-500"/> Synchronizing...
    </div>
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <div className="p-4 animate-in fade-in duration-700" style={{ fontFamily: themeFont }}>
        
        {/* HEADER SECTION (FIXED BOX VIEW) */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl shadow-lg">
               <FuelIcon className="text-yellow-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Fuel Tracking</h1>
              <p className="text-slate-500 italic mt-1.5 text-xs">Monitor fleet consumption and daily expenses.</p>
            </div>
          </div>
          
          <button 
              onClick={() => { setEditingId(null); setShowModal(true); }} 
              className="bg-slate-900 text-yellow-400 h-14 px-8 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-slate-800 transition-all active:scale-95 whitespace-nowrap"
          >
            <PlusCircle size={20} /> Add Fuel Entry
          </button>
        </header>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-6 text-[11px] font-semibold uppercase text-slate-400">Date</th>
                    <th className="p-6 text-[11px] font-semibold uppercase text-slate-400">Vehicle</th>
                    <th className="p-6 text-[11px] font-semibold uppercase text-slate-400">Driver</th>
                    <th className="p-6 text-[11px] font-semibold uppercase text-slate-400 text-center">Liters</th>
                    <th className="p-6 text-[11px] font-semibold uppercase text-slate-400 text-right">Total (LKR)</th>
                    <th className="p-6 text-[11px] font-semibold uppercase text-slate-400 text-center">Actions</th> 
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                  {logs.map(log => (
                  <tr key={log._id} className="hover:bg-yellow-50/40 transition-colors">
                      <td className="p-6 text-sm text-slate-600 font-medium">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="p-6">
                          <span className="bg-slate-900 text-yellow-400 px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider">{log.vehicleNo}</span>
                      </td>
                      <td className="p-6 text-sm text-slate-700 font-medium italic">{log.driver}</td>
                      <td className="p-6 text-sm text-slate-500 font-medium text-center">{log.liters} L</td>
                      <td className="p-6 text-base font-bold text-slate-900 text-right">
                          {Number(log.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-6 text-center">
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
        </div>

        {/* POPUP MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl p-10 relative overflow-y-auto max-h-[95vh] custom-scrollbar animate-in zoom-in-95 duration-300">
              
              <button onClick={handleCloseModal} className="absolute top-6 right-8 text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={28}/>
              </button>

              <h2 className="text-2xl font-bold uppercase tracking-tight mb-1 text-slate-900">
                {editingId ? "Edit Fuel Entry" : "New Fuel Entry"}
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
                  <label className="label-style">Vehicle</label>
                  <Autocomplete
                    options={vehicles.map(v => v.plateNumber)}
                    value={formData.vehicleNo}
                    onChange={(e, val) => setFormData({...formData, vehicleNo: val})}
                    renderInput={(params) => <TextField {...params} placeholder="Select Vehicle" />}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label-style">Driver</label>
                  <Autocomplete
                    options={drivers.map(d => d.name)}
                    value={formData.driver}
                    onChange={(e, val) => setFormData({...formData, driver: val})}
                    renderInput={(params) => <TextField {...params} placeholder="Select Driver" />}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label-style">Filling Station</label>
                  <input className="input-style-clean" placeholder="e.g. Medagampitiya" value={formData.fillingStation} onChange={e => setFormData({...formData, fillingStation: e.target.value})}/>
                </div>

                <div className="flex flex-col gap-2">
                   <label className="label-style">Fuel Type</label>
                   <Autocomplete
                    options={["Auto Diesel", "Super Diesel", "Petrol 92", "Petrol 95"]}
                    value={formData.fuelType}
                    onChange={(e, val) => setFormData({...formData, fuelType: val})}
                    renderInput={(params) => <TextField {...params} placeholder="Select Fuel Type" />}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label-style">Meter Reading</label>
                  <input className="input-style-clean" type="number" placeholder="Odometer" value={formData.meterReading} onChange={e => setFormData({...formData, meterReading: e.target.value})}/>
                </div>
                
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mt-2 items-end">
                  <div className="flex flex-col gap-2">
                    <label className="label-style">Liters</label>
                    <input className="input-style-clean" type="number" step="0.01" value={formData.liters} onChange={e => setFormData({...formData, liters: e.target.value})} required/>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="label-style">Cost Per Liter</label>
                    <input className="input-style-clean" type="number" step="0.01" value={formData.costPerLiter} onChange={e => setFormData({...formData, costPerLiter: e.target.value})} required/>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="label-style">Total (LKR)</label>
                    <div className="h-12 flex items-center justify-center bg-slate-900 text-yellow-400 rounded-xl font-bold text-xl shadow-inner border border-slate-800">
                      {formData.totalAmount}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-4 pt-4">
                  <button type="button" onClick={handleCloseModal} className="flex-1 py-4 border border-slate-200 rounded-xl font-bold uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-[2] py-4 bg-slate-900 text-yellow-400 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50">
                      {loading ? "Saving..." : editingId ? "Update Fuel Entry" : "Confirm & Save Entry"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .label-style { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-left: 4px; }
        .input-style-clean { 
          width: 100%; height: 48px; padding: 12px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; outline: none; transition: all 0.2s; font-weight: 500; font-size: 0.8rem; color: #334155; 
        }
        .input-style-clean:focus { background-color: #fff; border-color: #eab308; }
      `}} />
    </ThemeProvider>
  );
}