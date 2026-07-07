import { useEffect, useState } from "react";
import API from "../api";
import { toast } from "sonner";
import { 
  Truck, UserPlus, Trash2, Loader2, Edit3, X, Save, Plus, Fuel, 
  Calendar as CalIcon, Fingerprint, Hash, BadgeCheck, FileText, Settings2, Banknote
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- MUI & DATE PICKER COMPONENTS ---
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { createTheme, ThemeProvider, MenuItem, Select, FormControl } from '@mui/material';
import dayjs from 'dayjs';

const muiTheme = createTheme({
  palette: {
    primary: { main: '#1e293b' },
    secondary: { main: '#eab308' }
  },
  typography: { fontFamily: '"Inter", sans-serif' },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          height: '45px', 
          fontSize: '13px',
          fontWeight: 700,
          backgroundColor: 'rgba(255,255,255,0.4)',
          '& fieldset': { borderColor: 'transparent' },
          '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.1)' },
          '&.Mui-focused fieldset': { borderColor: '#1e293b', borderWidth: '1px' },
        },
        input: {
          padding: '10px 14px',
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { 
          fontSize: '10px', 
          fontWeight: 800, 
          color: '#64748b', 
          textTransform: 'uppercase',
          transform: 'translate(14px, 12px) scale(1)',
          '&.Mui-focused, &.MuiInputLabel-shrink': {
            transform: 'translate(14px, -8px) scale(0.75)',
            color: '#1e293b'
          }
        }
      }
    }
  }
});

export default function Management({ refresh }) {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingDriver, setEditingDriver] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [driverData, setDriverData] = useState({ 
    name: "", phone: "", licenseNo: "", licenseExpire: null 
  });
  
  const [vehicleData, setVehicleData] = useState({ 
    plateNumber: "", modelName: "", type: "", chassisNo: "", engineNo: "", 
    brand: "", serialNo: "", fuelType: "Diesel", yom: "", licenseValid: null, emissionValid: null,
    pricePerKM: "",
    owner: "" // 🎯 ADDED: Initialized owner state field
  });

  const loadData = async () => {
    try {
      const [d, v] = await Promise.all([API.get("/drivers"), API.get("/vehicles")]);
      setDrivers(d.data || []);
      setVehicles(v.data || []);
    } catch (err) { toast.error("Sync Error"); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAddDriver = async () => {
    if (!driverData.name || !driverData.phone) return toast.warning("Required fields missing");
    try {
      const payload = { 
        ...driverData,
        licenseExpire: driverData.licenseExpire ? dayjs(driverData.licenseExpire).format('YYYY-MM-DD') : null
      };
      await API.post("/drivers", payload);
      toast.success("Driver Registered Successfully");
      
      setDriverData({ name: "", phone: "", licenseNo: "", licenseExpire: null });
      loadData();
      
      if (refresh) refresh();
      
    } catch (err) { 
      const msg = err.response?.data?.message || "Failed to register";
      toast.error(msg); 
    }
  };

  const handleAddVehicle = async () => {
    if (!vehicleData.plateNumber) return toast.warning("Plate No required");
    try {
      const payload = {
        ...vehicleData,
        pricePerKM: Number(vehicleData.pricePerKM) || 0,
        licenseValid: vehicleData.licenseValid ? dayjs(vehicleData.licenseValid).format('YYYY-MM-DD') : null,
        emissionValid: vehicleData.emissionValid ? dayjs(vehicleData.emissionValid).format('YYYY-MM-DD') : null
      };
      await API.post("/vehicles", payload);
      toast.success("Unit Authorized");
      
      setVehicleData({ plateNumber: "", modelName: "", type: "", chassisNo: "", engineNo: "", brand: "", serialNo: "", fuelType: "Diesel", yom: "", licenseValid: null, emissionValid: null, pricePerKM: "", owner: "" });
      loadData();
      if (refresh) refresh();
    } catch (err) { 
      toast.error("Failed to authorize unit"); 
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Confirm deletion?")) return;
    try {
      await API.delete(`/${type}/${id}`);
      toast.success("Removed");
      loadData();
      if (refresh) refresh();
    } catch (err) { toast.error("Failed"); }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline text-yellow-600" size={40} /></div>;

  return (
    <ThemeProvider theme={muiTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="p-6 space-y-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
          
          <header>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tighter">
                <div className="p-2 bg-yellow-400 rounded-xl shadow-lg"><Truck size={26}/></div> Fleet Operations
            </h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            
            {/* REGISTER DRIVER */}
            <section className="bg-yellow-400 rounded-[2.5rem] p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-8 text-slate-900">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-yellow-400 shadow-xl"><UserPlus size={24}/></div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Register Driver</h2>
                </div>
                
                <div className="space-y-4">
                    <div className="modern-row"><UserPlus size={18}/><input placeholder="Full Name" value={driverData.name} onChange={e => setDriverData({...driverData, name: e.target.value})} /></div>
                    <div className="modern-row"><Hash size={18}/><input placeholder="Phone Number" value={driverData.phone} onChange={e => setDriverData({...driverData, phone: e.target.value})} /></div>
                    <div className="modern-row"><BadgeCheck size={18}/><input placeholder="License Number" value={driverData.licenseNo} onChange={e => setDriverData({...driverData, licenseNo: e.target.value})} /></div>
                    
                    <div className="pt-1">
                        <DatePicker 
                          label="License Expiry Date" 
                          value={driverData.licenseExpire} 
                          onChange={(v) => setDriverData({...driverData, licenseExpire: v})} 
                          slotProps={{ textField: { fullWidth: true, size: 'small' } }} 
                        />
                    </div>

                    <button onClick={handleAddDriver} className="w-full mt-2 py-4 bg-slate-900 text-yellow-400 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all">
                      <Save size={18}/> Confirm Registration
                    </button>
                </div>
            </section>

            {/* ADD FLEET UNIT */}
            <section className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-8 text-yellow-400">
                    <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-slate-900 shadow-xl"><Truck size={24}/></div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Add Fleet Unit</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="dark-row"><Hash size={16}/><input placeholder="Vehicle Plate" value={vehicleData.plateNumber} onChange={e => setVehicleData({...vehicleData, plateNumber: e.target.value})} /></div>
                    <div className="dark-row"><Truck size={16}/><input placeholder="Model Name" value={vehicleData.modelName} onChange={e => setVehicleData({...vehicleData, modelName: e.target.value})} /></div>
                    <div className="dark-row"><FileText size={16}/><input placeholder="Vehicle Type" value={vehicleData.type} onChange={e => setVehicleData({...vehicleData, type: e.target.value})} /></div>
                    <div className="dark-row"><BadgeCheck size={16}/><input placeholder="Brand" value={vehicleData.brand} onChange={e => setVehicleData({...vehicleData, brand: e.target.value})} /></div>
                    <div className="dark-row"><Fingerprint size={16}/><input placeholder="Chassis No" value={vehicleData.chassisNo} onChange={e => setVehicleData({...vehicleData, chassisNo: e.target.value})} /></div>
                    <div className="dark-row"><Settings2 size={16}/><input placeholder="Engine No" value={vehicleData.engineNo} onChange={e => setVehicleData({...vehicleData, engineNo: e.target.value})} /></div>
                    <div className="dark-row"><Hash size={16}/><input placeholder="Serial No" value={vehicleData.serialNo} onChange={e => setVehicleData({...vehicleData, serialNo: e.target.value})} /></div>
                    
                    <FormControl fullWidth size="small">
                        <Select value={vehicleData.fuelType} onChange={e => setVehicleData({...vehicleData, fuelType: e.target.value})} sx={{ borderRadius: '1rem', bgcolor: '#1e293b', color: '#fff', height: '45px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' } }}>
                            <MenuItem value="Diesel">Diesel</MenuItem><MenuItem value="Petrol">Petrol</MenuItem><MenuItem value="Electric">Electric</MenuItem>
                        </Select>
                    </FormControl>

                    <div className="dark-row"><CalIcon size={16}/><input placeholder="YOM (Year)" value={vehicleData.yom} onChange={e => setVehicleData({...vehicleData, yom: e.target.value})} /></div>
                    
                    <div className="dark-row border-yellow-500/50">
                        <Banknote size={16} className="text-yellow-400"/>
                        <input 
                            placeholder="Price Per 1 KM (LKR)" 
                            type="number"
                            value={vehicleData.pricePerKM} 
                            onChange={e => setVehicleData({...vehicleData, pricePerKM: e.target.value})} 
                        />
                    </div>

                    {/* 🎯 ADDED: OWNER FIELD MAPPED TO THE GRID GRID LAYOUT */}
                    <div className="dark-row md:col-span-2 border-slate-700/80">
                        <UserPlus size={16} className="text-slate-400"/>
                        <input 
                            placeholder="Vehicle Owner / Company Name" 
                            type="text"
                            value={vehicleData.owner} 
                            onChange={e => setVehicleData({...vehicleData, owner: e.target.value})} 
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                        <DatePicker 
                          label="Revenue License Valid" 
                          value={vehicleData.licenseValid} 
                          onChange={(v) => setVehicleData({...vehicleData, licenseValid: v})} 
                          slotProps={{ textField: { fullWidth: true, size: 'small', sx: { '& .MuiOutlinedInput-root': { bgcolor: '#1e293b', borderRadius: '1rem', color: '#fff' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiInputBase-input': { color: '#ffffff' }, '& .MuiSvgIcon-root': { color: '#ffffff' } } } }} 
                        />
                        <DatePicker 
                          label="Emission Expiry" 
                          value={vehicleData.emissionValid} 
                          onChange={(v) => setVehicleData({...vehicleData, emissionValid: v})} 
                          slotProps={{ textField: { fullWidth: true, size: 'small', sx: { '& .MuiOutlinedInput-root': { bgcolor: '#1e293b', borderRadius: '1rem', color: '#fff' }, '& .MuiInputLabel-root': { color: '#94a3b8' }, '& .MuiInputBase-input': { color: '#ffffff' }, '& .MuiSvgIcon-root': { color: '#ffffff' } } } }} 
                        />
                    </div>

                    <button onClick={handleAddVehicle} className="md:col-span-2 mt-2 py-4 bg-yellow-400 text-slate-900 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all">
                      <BadgeCheck size={18}/> Authorize Unit
                    </button>
                </div>
            </section>
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            .modern-row { display: flex; align-items: center; background: rgba(255,255,255,0.7); border-radius: 1.2rem; height: 45px; padding: 0 20px; transition: 0.3s; }
            .modern-row:focus-within { background: white; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1); }
            .modern-row input { background: transparent; border: none; outline: none; width: 100%; font-weight: 800; color: #1e293b; font-size: 13px; margin-left: 15px; }
            .modern-row svg { color: #1e293b; opacity: 0.3; }

            .dark-row { display: flex; align-items: center; background: #1e293b; border-radius: 1rem; height: 45px; padding: 0 20px; border: 1px solid #334155; transition: 0.3s; }
            .dark-row:focus-within { border-color: #eab308; background: #0f172a; }
            .dark-row input { background: transparent; border: none; outline: none; width: 100%; font-weight: 700; color: #f1f5f9; font-size: 13px; margin-left: 15px; }
            .dark-row svg { color: #475569; }
          `}} />
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
}