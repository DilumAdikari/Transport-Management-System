import React, { useState, useEffect } from "react";
import API from "../api";
import { toast } from "sonner";
import { 
  Wrench, CalendarDays, Truck, FileText, Store, 
  User, Banknote, CreditCard, PlusCircle, Loader2, X, Sparkles
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
  const [fetching, setFetching] = useState(true);

  const themeFont = '"Inter", "Open Sans", "Segoe UI", system-ui, sans-serif';

  useEffect(() => { fetchInitialData(); }, []);

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
    } catch (err) {
      toast.error("Database sync error");
    } finally {
      setFetching(false);
    }
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

  if (fetching) return (
    <div className="h-screen flex items-center justify-center font-medium text-slate-400 bg-[#F8FAFC]" style={{ fontFamily: themeFont }}>
      <Loader2 className="animate-spin text-yellow-500 mr-2" /> Synchronizing...
    </div>
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <div className="p-4 animate-in fade-in duration-700" style={{ fontFamily: themeFont }}>
        
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl shadow-lg"><Wrench className="text-yellow-400" size={28} /></div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Maintenance Logs</h1>
              <p className="text-slate-500 font-medium italic text-sm">Vehicle service and expense history.</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-slate-900 text-yellow-400 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-slate-800 transition-all active:scale-95">
            <PlusCircle size={20} /> Add New Record
          </button>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden mb-10">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-6 text-[11px] font-semibold uppercase text-slate-400">Date</th>
                  <th className="p-6 text-[11px] font-semibold uppercase text-slate-400">Vehicle</th>
                  <th className="p-6 text-[11px] font-semibold uppercase text-slate-400">Description</th>
                  <th className="p-6 text-[11px] font-semibold uppercase text-slate-400">Driver</th>
                  <th className="p-6 text-[11px] font-semibold uppercase text-slate-400 text-right">Amount (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-yellow-50/40 transition-colors">
                    <td className="p-6 text-sm text-slate-600 font-medium">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="p-6">
                      <span className="bg-slate-900 text-yellow-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase">{log.vehicleNo}</span>
                    </td>
                    <td className="p-6 text-sm text-slate-800 font-medium">{log.description}</td>
                    <td className="p-6 text-sm text-slate-700 italic font-medium">{log.driver}</td>
                    <td className="p-6 text-base font-bold text-slate-900 text-right">{Number(log.amount)?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative custom-scrollbar p-10 animate-in zoom-in-95 duration-300">
              
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-8 text-slate-400 hover:text-slate-900 transition-colors"><X size={28} /></button>

              <h2 className="text-2xl font-bold text-slate-900 uppercase mb-1">Add Service Record</h2>
              <p className="text-sm text-slate-500 mb-8 font-medium">Please enter maintenance details accurately.</p>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex flex-col gap-2">
                  <label className="label-style">Service Date</label>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker value={selectedDate} onChange={(v) => setSelectedDate(v)} slotProps={{ textField: { fullWidth: true } }} />
                  </LocalizationProvider>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label-style">Vehicle Plate</label>
                  <Autocomplete
                    options={vehicles.map(v => v.plateNumber)}
                    value={formData.vehicleNo}
                    onChange={(e, val) => setFormData({...formData, vehicleNo: val})}
                    renderInput={(params) => <TextField {...params} placeholder="Select Vehicle" />}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label-style">Responsible Driver</label>
                  <Autocomplete
                    options={drivers.map(d => d.name)}
                    value={formData.driver}
                    onChange={(e, val) => setFormData({...formData, driver: val})}
                    renderInput={(params) => <TextField {...params} placeholder="Select Driver" />}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label-style">Maintenance Category</label>
                  <Autocomplete
                    options={["Preventive", "Corrective", "Tire", "Breakdown", "Other"]}
                    value={formData.maintenanceType}
                    onChange={(e, val) => setFormData({...formData, maintenanceType: val})}
                    renderInput={(params) => <TextField {...params} placeholder="Select Type" />}
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="label-style">Work Description</label>
                  <input className="input-style-clean" type="text" placeholder="Repair details..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label-style">Garage / Shop</label>
                  <input className="input-style-clean" type="text" value={formData.shopGarage} onChange={(e) => setFormData({...formData, shopGarage: e.target.value})} />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label-style">Service Cost (LKR)</label>
                  <input className="input-style-clean" type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                </div>

                <div className="md:col-span-2 flex gap-4 mt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 border border-slate-200 rounded-xl font-bold uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-[2] py-4 bg-slate-900 text-yellow-400 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all">
                    {loading ? "Processing..." : "Confirm & Save Entry"}
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