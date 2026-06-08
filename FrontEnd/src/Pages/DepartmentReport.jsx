import { useEffect, useState } from "react";
import API from "../api";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Printer,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Gauge,
  Banknote,
} from "lucide-react";

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
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            padding: "2px 12px !important",
            borderRadius: "0.8rem",
            backgroundColor: "#fff",
            border: "2px solid #eab308",
            "& fieldset": { border: "none" },
          },
        },
      },
    },
  },
});

export default function DeptReport() {
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedVehicle, setSelectedVehicle] = useState("All Vehicles");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const themeFont = '"Inter", "Open Sans", "Segoe UI", system-ui, sans-serif';

  const loadData = async () => {
    try {
      const [toursRes, deptsRes, vehiclesRes] = await Promise.all([
        API.get("/tours"),
        API.get("/departments"),
        API.get("/vehicles"),
      ]);

      const allocatedTours = toursRes.data.filter(
        (t) => t.status === "Allocated",
      );

      setTours(allocatedTours);
      setFilteredTours(allocatedTours);
      setDepartments(deptsRes.data || []);
      setVehicles(vehiclesRes.data || []);
    } catch (error) {
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Logic
  useEffect(() => {
    let data = tours;
    if (selectedVehicle !== "All Vehicles")
      data = data.filter((t) => t.vehicle === selectedVehicle);
    if (selectedDept !== "All Departments")
      data = data.filter((t) => t.department === selectedDept);
    if (dateFrom)
      data = data.filter((t) =>
        dayjs(t.date).isAfter(dateFrom.subtract(1, "day")),
      );
    if (dateTo)
      data = data.filter((t) => dayjs(t.date).isBefore(dateTo.add(1, "day")));
    setFilteredTours(data);
  }, [selectedVehicle, selectedDept, dateFrom, dateTo, tours]);

  // --- CALCULATION LOGIC ---
  const getVehicleRate = (plate) => {
    const vehicle = vehicles.find((v) => v.plateNumber === plate);
    return vehicle ? Number(vehicle.pricePerKM) || 0 : 0;
  };

  const reportTotals = filteredTours.reduce(
    (acc, t) => {
      const distance = Number(t.endMeter || 0) - Number(t.startMeter || 0);
      const rate = getVehicleRate(t.vehicle);
      const tourCost = distance * rate;

      acc.km += distance;
      acc.cost += tourCost;
      return acc;
    },
    { km: 0, cost: 0 },
  );

  // --- 🖨️ PRINT LOGIC ---
  const handlePrint = () => {
    window.print();
  };

  // --- 📊 CSV EXPORT LOGIC ---
  const handleExportCSV = () => {
    if (filteredTours.length === 0)
      return toast.error("No data available to export");

    const headers = [
      "Date",
      "Vehicle",
      "Rate (1KM)",
      "Department",
      "Start Meter",
      "End Meter",
      "Travelled KM",
      "Total Cost (LKR)",
    ];

    const rows = filteredTours.map((t) => {
      const distance = Number(t.endMeter || 0) - Number(t.startMeter || 0);
      const rate = getVehicleRate(t.vehicle);
      const cost = distance * rate;

      return [
        t.date,
        `"${t.vehicle}"`, // Encapsulate in quotes to preserve formatting
        rate,
        `"${t.department}"`,
        t.startMeter,
        t.endMeter,
        distance,
        cost.toFixed(2),
      ];
    });

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `TMS_Dept_Report_${dayjs().format("YYYY-MM-DD")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV Exported Successfully");
  };

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse text-slate-400 font-bold tracking-widest">
        GENERATING ANALYTICS...
      </div>
    );

  return (
    <ThemeProvider theme={muiTheme}>
      <div
        className="space-y-8 animate-in fade-in duration-700 pb-10"
        style={{ fontFamily: themeFont }}
      >
        {/* HEADER */}
        <header className="flex justify-between items-center no-print">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-yellow-400 rounded-lg shadow-sm">
                <Calculator size={20} />
              </div>{" "}
              Dept. Distance & Price Report
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Operational Cost Analysis
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="bg-white border border-slate-200 p-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-slate-900 text-yellow-400 px-6 py-3 rounded-xl font-bold text-xs uppercase flex items-center gap-3 shadow-lg hover:bg-slate-800 transition-all"
            >
              <Download size={18} /> Export CSV
            </button>
          </div>
        </header>

        {/* FILTERS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 items-end no-print">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
              Vehicle
            </label>
            <Autocomplete
              size="small"
              options={["All Vehicles", ...vehicles.map((v) => v.plateNumber)]}
              value={selectedVehicle}
              onChange={(e, v) => setSelectedVehicle(v || "All Vehicles")}
              renderInput={(p) => <TextField {...p} />}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
              Department
            </label>
            <Autocomplete
              size="small"
              options={["All Departments", ...departments.map((d) => d.name)]}
              value={selectedDept}
              onChange={(e, v) => setSelectedDept(v || "All Departments")}
              renderInput={(p) => <TextField {...p} />}
            />
          </div>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                From
              </label>
              <DatePicker
                value={dateFrom}
                onChange={(v) => setDateFrom(v)}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                To
              </label>
              <DatePicker
                value={dateTo}
                onChange={(v) => setDateTo(v)}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </div>
          </LocalizationProvider>

          <button
            onClick={() => {
              setSelectedVehicle("All Vehicles");
              setSelectedDept("All Departments");
              setDateFrom(null);
              setDateTo(null);
            }}
            className="h-10 bg-slate-50 text-slate-400 rounded-xl font-bold text-[10px] uppercase hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white flex justify-between items-center relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                Total Distance
              </p>
              <h2 className="text-5xl font-black">
                {reportTotals.km} <span className="text-lg opacity-40">KM</span>
              </h2>
            </div>
            <Gauge
              size={80}
              className="text-white/5 absolute right-[-10px] group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex justify-between items-center relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                Estimated Cost (LKR)
              </p>
              <h2 className="text-5xl font-black text-slate-900">
                {reportTotals.cost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </h2>
            </div>
            <Banknote
              size={80}
              className="text-emerald-500/5 absolute right-[-10px] group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden report-container">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <tr>
                  <th className="px-8 py-6">Date</th>
                  <th className="px-8 py-6">Vehicle</th>
                  <th className="px-8 py-6">Dept. Rate (1KM)</th>
                  <th className="px-8 py-6">Department</th>
                  <th className="px-8 py-6">Start / End</th>
                  <th className="px-8 py-6">Travelled (KM)</th>
                  <th className="px-8 py-6 text-right text-emerald-600">
                    Total Cost
                  </th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold divide-y divide-slate-50">
                {filteredTours.map((t) => {
                  const distance =
                    Number(t.endMeter || 0) - Number(t.startMeter || 0);
                  const vehicleRate = getVehicleRate(t.vehicle);
                  const finalCost = distance * vehicleRate;

                  return (
                    <tr
                      key={t._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-5 text-slate-400">{t.date}</td>
                      <td className="px-8 py-5 text-slate-900 font-bold">
                        {t.vehicle}
                      </td>
                      <td className="px-8 py-5 text-slate-400">
                        Rs. {vehicleRate.toFixed(2)}
                      </td>
                      <td className="px-8 py-5">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-md text-[9px] uppercase tracking-tighter">
                          {t.department}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-slate-400">
                        {t.startMeter} - {t.endMeter}
                      </td>
                      <td className="px-8 py-5 text-slate-600">
                        {distance} KM
                      </td>
                      <td className="px-8 py-5 text-right text-emerald-600 font-black">
                        Rs.{" "}
                        {finalCost.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredTours.length === 0 && (
              <p className="text-center py-24 text-slate-300 uppercase text-[10px] font-black tracking-widest">
                No matching records found
              </p>
            )}
          </div>
        </div>

        {/* 🖨️ PRINT-ONLY CSS */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media print {
            .no-print, aside, nav, button, .MuiAutocomplete-root, .MuiFormControl-root { display: none !important; }
            body { background: white !important; padding: 0 !important; margin: 0 !important; }
            .space-y-8 { space-y: 0 !important; }
            .report-container { border: none !important; shadow: none !important; border-radius: 0 !important; }
            .grid { display: block !important; }
            .bg-slate-900 { background: #f8fafc !important; color: black !important; border: 1px solid #eee; margin-bottom: 20px; }
            .text-white { color: black !important; }
            .text-yellow-400 { color: #856404 !important; }
            table { font-size: 10px !important; }
            th, td { padding: 10px 5px !important; }
          }
        `,
          }}
        />
      </div>
    </ThemeProvider>
  );
}
