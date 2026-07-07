import React, { useState, useEffect } from "react";
import API from "../api";
import { Gauge, Calendar, Truck, FileText, Loader2 } from "lucide-react";

export default function VehicleReport() {
  const [vehicles, setVehicles] = useState([]);
  const [selection, setSelection] = useState({ plate: "", start: "", end: "" });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/vehicles").then(res => setVehicles(res.data));
  }, []);

  const generateReport = async () => {
    if (!selection.plate || !selection.start || !selection.end) return;
    setLoading(true);
    try {
      const res = await API.get(`/reports/vehicle-usage?vehiclePlate=${selection.plate}&startDate=${selection.start}&endDate=${selection.end}`);
      setReportData(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
          <FileText className="text-yellow-600" /> Vehicle Distance Report
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-slate-400">Select Vehicle</label>
            <select 
              className="p-3 bg-slate-50 rounded-xl font-bold text-xs outline-none border-2 border-transparent focus:border-yellow-500"
              onChange={(e) => setSelection({...selection, plate: e.target.value})}
            >
              <option value="">Choose Unit...</option>
              {vehicles.map(v => <option key={v._id} value={v.plateNumber}>{v.plateNumber}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-slate-400">From Date</label>
            <input type="date" className="p-3 bg-slate-50 rounded-xl text-xs font-bold" onChange={(e) => setSelection({...selection, start: e.target.value})} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-slate-400">To Date</label>
            <input type="date" className="p-3 bg-slate-50 rounded-xl text-xs font-bold" onChange={(e) => setSelection({...selection, end: e.target.value})} />
          </div>

          <button 
            onClick={generateReport}
            className="bg-slate-900 text-yellow-400 p-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16}/> : "Generate Analysis"}
          </button>
        </div>
      </div>

      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Total Distance</p>
            <h3 className="text-5xl font-black text-yellow-400 tracking-tighter">
              {reportData.totalDistance} <span className="text-xl">KM</span>
            </h3>
          </div>

          <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100">
            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] mb-2">Efficiency Details</p>
            <div className="space-y-2">
                <p className="text-sm font-bold text-slate-700">Tours Completed: {reportData.tourCount}</p>
                <p className="text-xs font-medium text-slate-500 italic">Reading: {reportData.firstReading} → {reportData.lastReading}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}