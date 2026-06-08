import React, { useState, useEffect } from "react";
import API from "../api";
import * as XLSX from "xlsx";
import {
  User,
  RefreshCcw,
  Truck,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

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
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "1rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "0.6rem", // Slightly smaller radius
          height: "40px", // REDUCED HEIGHT
          backgroundColor: "#f8fafc",
          "& fieldset": { borderColor: "#e2e8f0" },
          "&.Mui-focused fieldset": { borderWidth: "1px" },
        },
        input: {
          padding: "8px 12px !important", // COMPACT PADDING
          fontSize: "0.75rem", // SMALLER TEXT
          fontWeight: 500,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: "0.75rem" },
      },
    },
  },
});

export default function DriverReport() {
  const [tours, setTours] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Filter States
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [driverSearch, setDriverSearch] = useState("");

  const themeFont = '"Inter", "Open Sans", "Segoe UI", system-ui, sans-serif';

  const loadData = async () => {
    try {
      const [toursRes, driversRes] = await Promise.all([
        API.get("/tours"),
        API.get("/drivers").catch(() => ({ data: [] })),
      ]);
      const allocated = toursRes.data.filter((t) => t.status === "Allocated");
      setTours(allocated);
      setFilteredData(allocated);
      setDrivers(driversRes.data.map((d) => d.name));
    } catch (error) {
      console.error("Sync Error:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let data = tours;
    if (dateFrom)
      data = data.filter((t) =>
        dayjs(t.date).isAfter(dateFrom.subtract(1, "day")),
      );
    if (dateTo)
      data = data.filter((t) => dayjs(t.date).isBefore(dateTo.add(1, "day")));
    if (driverSearch) data = data.filter((t) => t.driver === driverSearch);
    setFilteredData(data);
  }, [dateFrom, dateTo, driverSearch, tours]);

  const exportToExcel = () => {
    const dataToExport = filteredData.map((t) => ({
      "Tour ID": t.tourId,
      Date: t.date,
      Driver: t.driver,
      Vehicle: t.vehicle,
      From: t.fromLocation,
      To: t.toLocation,
      Dept: t.department,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Driver Log");
    XLSX.writeFile(workbook, `TMS_Driver_Report.xlsx`);
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <div
        className="p-4 space-y-6 animate-in fade-in duration-700"
        style={{ fontFamily: themeFont }}
      >
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-3xl border border-slate-100 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 rounded-xl shadow-md">
              <FileText className="text-yellow-400" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
                Driver Journey Log
              </h1>
              <p className="text-slate-500 font-medium italic mt-1 text-[10px]">
                Historical transport records.
              </p>
            </div>
          </div>

          <button
            onClick={exportToExcel}
            className="bg-slate-900 text-yellow-400 h-11 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
          >
            <FileSpreadsheet size={16} /> Export Excel
          </button>
        </header>

        {/* COMPACT FILTER BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="flex flex-col gap-1.5">
              <label className="label-style">Date From</label>
              <DatePicker
                value={dateFrom}
                onChange={(v) => setDateFrom(v)}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label-style">Date To</label>
              <DatePicker
                value={dateTo}
                onChange={(v) => setDateTo(v)}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </div>
          </LocalizationProvider>

          <div className="flex flex-col gap-1.5">
            <label className="label-style">Select Driver</label>
            <Autocomplete
              size="small"
              options={drivers}
              value={driverSearch}
              onChange={(e, val) => setDriverSearch(val || "")}
              renderInput={(params) => (
                <TextField {...params} placeholder="Search Driver..." />
              )}
            />
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Driver</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Schedule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.length > 0 ? (
                  filteredData.map((t, i) => (
                    <tr
                      key={i}
                      className="hover:bg-yellow-50/30 transition-all group"
                    >
                      <td className="px-6 py-4">
                        <span className="bg-slate-900 text-yellow-400 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                          {t.tourId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center text-slate-900">
                            <User size={12} />
                          </div>
                          <span className="text-sm font-medium text-slate-700 italic">
                            {t.driver}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Truck size={14} />
                          <span className="text-[11px] font-bold uppercase">
                            {t.vehicle}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">
                        {t.fromLocation} → {t.toLocation}
                      </td>
                      <td className="px-6 py-4 text-[10px] font-medium text-slate-400">
                        {t.date} | {t.time}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-20 text-center text-slate-300 font-bold italic uppercase tracking-widest text-xs"
                    >
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .label-style { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-left: 2px; }
      `,
        }}
      />
    </ThemeProvider>
  );
}
