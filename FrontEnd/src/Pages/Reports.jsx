import React, { useState, useEffect } from "react";
import API from "../api";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  FileText, User, Truck, 
  RefreshCcw
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
          borderRadius: '0.6rem',
          height: '40px', // COMPACT HEIGHT
          backgroundColor: '#f8fafc',
          '& fieldset': { borderColor: '#e2e8f0' },
          '&.Mui-focused fieldset': { borderWidth: '1px' },
        },
        input: {
          padding: '8px 12px !important',
          fontSize: '0.75rem',
          fontWeight: 500,
        }
      }
    }
  }
});

export default function Reports() {
  const [tours, setTours] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [driverFilter, setDriverFilter] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");

  // Data for Dropdowns
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const themeFont = '"Inter", "Open Sans", "Segoe UI", system-ui, sans-serif';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [toursRes, driversRes, vehiclesRes] = await Promise.all([
        API.get("/tours"),
        API.get("/drivers").catch(() => ({ data: [] })),
        API.get("/vehicles").catch(() => ({ data: [] }))
      ]);

      const allocatedTours = toursRes.data.filter(t => t.status === "Allocated");
      setTours(allocatedTours);
      setFilteredData(allocatedTours);
      setDrivers(driversRes.data.map(d => d.name));
      setVehicles(vehiclesRes.data.map(v => v.plateNumber));
    } catch (error) {
      console.error("Report Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filter Logic
  useEffect(() => {
    let data = tours;
    if (dateFrom) data = data.filter(t => dayjs(t.date).isAfter(dateFrom.subtract(1, 'day')));
    if (dateTo) data = data.filter(t => dayjs(t.date).isBefore(dateTo.add(1, 'day')));
    if (driverFilter) data = data.filter(t => t.driver === driverFilter);
    if (vehicleFilter) data = data.filter(t => t.vehicle === vehicleFilter);
    setFilteredData(data);
  }, [dateFrom, dateTo, driverFilter, vehicleFilter, tours]);

  const resetFilters = () => {
    setDateFrom(null);
    setDateTo(null);
    setDriverFilter("");
    setVehicleFilter("");
  };

  // Data Preparation for Charts
  const driverChartData = filteredData.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.driver);
    if (existing) existing.total += 1;
    else acc.push({ name: curr.driver || "Unassigned", total: 1 });
    return acc;
  }, []);

  const vehicleChartData = filteredData.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.vehicle);
    if (existing) existing.total += 1;
    else acc.push({ name: curr.vehicle || "Unassigned", total: 1 });
    return acc;
  }, []);

  return (
    <ThemeProvider theme={muiTheme}>
      <div className="space-y-6 animate-in fade-in duration-700 p-4" style={{ fontFamily: themeFont }}>
        
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-3xl border border-slate-100 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 rounded-xl shadow-md">
               <FileText className="text-yellow-400" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">Logistics Analytics</h1>
              <p className="text-slate-500 font-medium italic mt-1 text-[10px]">Fleet performance & driver utilization.</p>
            </div>
          </div>
          
          <button 
            onClick={resetFilters}
            className="flex items-center gap-2 px-6 h-11 bg-slate-900 text-yellow-400 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md hover:bg-slate-800 transition-all active:scale-95"
          >
            <RefreshCcw size={16}/> Reset Filters
          </button>
        </header>

        {/* COMPACT FILTER BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="flex flex-col gap-1.5">
              <label className="label-style">Date From</label>
              <DatePicker value={dateFrom} onChange={(v) => setDateFrom(v)} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label-style">Date To</label>
              <DatePicker value={dateTo} onChange={(v) => setDateTo(v)} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
            </div>
          </LocalizationProvider>

          <div className="flex flex-col gap-1.5">
            <label className="label-style">Driver</label>
            <Autocomplete
              size="small"
              options={drivers}
              value={driverFilter}
              onChange={(e, val) => setDriverFilter(val || "")}
              renderInput={(params) => <TextField {...params} placeholder="All Drivers" />}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label-style">Vehicle</label>
            <Autocomplete
              size="small"
              options={vehicles}
              value={vehicleFilter}
              onChange={(e, val) => setVehicleFilter(val || "")}
              renderInput={(params) => <TextField {...params} placeholder="All Units" />}
            />
          </div>
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-[400px]">
            <h3 className="font-bold mb-6 text-slate-800 text-[10px] flex items-center gap-2 uppercase tracking-widest opacity-60">
              <User size={14} className="text-yellow-600"/> Driver Utilization
            </h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={driverChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500, fontFamily: themeFont, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500, fontFamily: themeFont, fill: '#94a3b8' }} />
                <Tooltip cursor={{fill: '#fff7ed'}} contentStyle={{ borderRadius: '12px', border: 'none', fontFamily: themeFont, fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="total" fill="#eab308" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-[400px]">
            <h3 className="font-bold mb-6 text-slate-800 text-[10px] flex items-center gap-2 uppercase tracking-widest opacity-60">
              <Truck size={14} className="text-slate-900"/> Fleet Utilization
            </h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={vehicleChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500, fontFamily: themeFont, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500, fontFamily: themeFont, fill: '#94a3b8' }} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', fontFamily: themeFont, fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="total" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .label-style { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-left: 2px; }
      `}} />
    </ThemeProvider>
  );
}