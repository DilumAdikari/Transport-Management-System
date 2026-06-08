import React, { useState, useEffect } from "react";
import API from "../api";
import { toast } from "sonner";
import {
  Truck,
  Activity,
  Loader2,
  FileSearch,
  Navigation,
  Gauge,
  Calendar,
  Download,
  ChevronRight,
} from "lucide-react";
import * as XLSX from "xlsx";

// --- MUI & DATE PICKER IMPORTS ---
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Autocomplete,
  TextField,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import dayjs from "dayjs";

const muiTheme = createTheme({
  palette: {
    primary: { main: "#eab308" },
    text: { primary: "#1e293b" },
  },
  typography: {
    fontFamily: '"Inter", "Open Sans", sans-serif',
  },
  components: {
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

export default function VehicleDistanceReport() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);

  // Filter States
  const [selection, setSelection] = useState({
    plate: "",
    start: dayjs().subtract(1, "month"),
    end: dayjs(),
  });

  const themeFont = '"Inter", "Open Sans", "Segoe UI", system-ui, sans-serif';

  useEffect(() => {
    API.get("/vehicles")
      .then((res) => setVehicles(res.data.map((v) => v.plateNumber)))
      .catch(() => toast.error("Failed to load vehicle list"));
  }, []);

  const generateReport = async () => {
    if (!selection.plate) return toast.warning("Please select a vehicle first");

    setLoading(true);
    try {
      const res = await API.get("/tours");
      // Filter logic for selected vehicle, date range, and allocated status
      const filtered = res.data.filter(
        (t) =>
          t.vehicle === selection.plate &&
          dayjs(t.date).isAfter(selection.start.subtract(1, "day")) &&
          dayjs(t.date).isBefore(selection.end.add(1, "day")) &&
          t.status === "Allocated",
      );

      setReportData(filtered);
      if (filtered.length === 0) toast.info("No records found for this period");
      else toast.success("Data Loaded");
    } catch (err) {
      toast.error("Error generating distance report");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    if (reportData.length === 0) return;
    const exportItems = reportData.map((t) => ({
      Date: t.date,
      Vehicle: t.vehicle,
      Driver: t.driver,
      Route: `${t.fromLocation} to ${t.toLocation}`,
      "Start Odo": t.startMeter || 0,
      "End Odo": t.endMeter || 0,
      "Distance (KM)":
        t.endMeter && t.startMeter ? t.endMeter - t.startMeter : 0,
    }));
    const ws = XLSX.utils.json_to_sheet(exportItems);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Distance Report");
    XLSX.writeFile(wb, `${selection.plate}_Distance_Report.xlsx`);
  };

  const totalDistance = reportData.reduce(
    (acc, curr) => acc + (curr.endMeter - curr.startMeter || 0),
    0,
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <div
        className="p-4 space-y-6 animate-in fade-in duration-700"
        style={{ fontFamily: themeFont }}
      >
        {/* COMPACT HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-3xl border border-slate-100 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 rounded-xl shadow-md">
              <Activity className="text-yellow-400" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Vehicle Distance Report
              </h1>
              <p className="text-slate-500 font-medium italic text-[10px]">
                Odometer-based trip analysis.
              </p>
            </div>
          </div>

          {reportData.length > 0 && (
            <button
              onClick={exportExcel}
              className="bg-emerald-600 text-white h-11 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              <Download size={16} /> Download Excel
            </button>
          )}
        </header>

        {/* COMPACT FILTER BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="label-style text-slate-400">Select Vehicle</label>
            <Autocomplete
              size="small"
              options={vehicles}
              value={selection.plate}
              onChange={(e, val) =>
                setSelection({ ...selection, plate: val || "" })
              }
              renderInput={(params) => (
                <TextField {...params} placeholder="Plate No..." />
              )}
            />
          </div>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="flex flex-col gap-1.5">
              <label className="label-style text-slate-400">From</label>
              <DatePicker
                value={selection.start}
                onChange={(v) => setSelection({ ...selection, start: v })}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label-style text-slate-400">To</label>
              <DatePicker
                value={selection.end}
                onChange={(v) => setSelection({ ...selection, end: v })}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </div>
          </LocalizationProvider>

          <button
            onClick={generateReport}
            disabled={loading}
            className="h-10 bg-slate-900 text-yellow-400 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <FileSearch size={16} />
            )}
            Run Analysis
          </button>
        </div>

        {/* COMPACT STATS & TABLE */}
        {reportData.length > 0 && (
          <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
            {/* MINI SUMMARY CARD */}
            <div className="bg-slate-900 px-8 py-5 rounded-[1.5rem] text-white flex justify-between items-center shadow-lg border border-slate-800">
              <div>
                <p className="text-yellow-400 text-[9px] font-bold uppercase tracking-[0.15em] mb-0.5">
                  Cumulative Distance
                </p>
                <h2 className="text-2xl font-bold tracking-tight">
                  {totalDistance.toLocaleString()}
                  <span className="text-xs font-medium text-slate-500 ml-1.5 uppercase">
                    km
                  </span>
                </h2>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.15em] mb-0.5">
                  Trip Total
                </p>
                <h2 className="text-xl font-bold text-white">
                  {reportData.length} Journeys
                </h2>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Route Details</th>
                      <th className="px-6 py-4 text-center">Start Odo</th>
                      <th className="px-6 py-4 text-center">End Odo</th>
                      <th className="px-6 py-4 text-right text-indigo-600">
                        Travelled
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.map((t, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50/50 transition-all group"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                          {dayjs(t.date).format("DD/MM/YYYY")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800">
                              {t.fromLocation} → {t.toLocation}
                            </span>
                            <span className="text-[10px] text-slate-400 italic font-medium">
                              Driver: {t.driver}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-xs font-mono text-slate-400">
                          {t.startMeter || 0}
                        </td>
                        <td className="px-6 py-4 text-center text-xs font-mono text-slate-400">
                          {t.endMeter || 0}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold border border-indigo-100/50">
                            {t.endMeter - t.startMeter || 0} KM
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .label-style { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-left: 2px; }
      `,
        }}
      />
    </ThemeProvider>
  );
}
