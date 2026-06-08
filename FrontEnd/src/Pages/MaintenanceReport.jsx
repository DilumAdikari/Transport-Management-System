import React, { useState, useEffect, useRef } from "react";
import API from "../api";
import { toast } from "sonner";
import { Wrench, Printer, Loader2, FileSearch, User } from "lucide-react";
import { useReactToPrint } from "react-to-print";

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

export default function MaintenanceReport() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const reportRef = useRef(null);

  const [selection, setSelection] = useState({
    plate: "All Vehicles",
    start: dayjs().startOf("month"),
    end: dayjs(),
  });

  const themeFont = '"Inter", "Open Sans", "Segoe UI", system-ui, sans-serif';

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `Maintenance_Report_${selection.plate}`,
  });

  useEffect(() => {
    API.get("/vehicles")
      .then((res) => {
        const plates = res.data.map((v) => v.plateNumber);
        setVehicles(["All Vehicles", ...plates]);
      })
      .catch(() => toast.error("Failed to load vehicle list"));
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await API.get("/maintenance");
      const filtered = res.data.filter((item) => {
        const itemDate = dayjs(item.date);
        const dateMatch =
          itemDate.isAfter(selection.start.subtract(1, "day")) &&
          itemDate.isBefore(selection.end.add(1, "day"));
        const vehicleMatch =
          selection.plate === "All Vehicles" ||
          item.vehicleNo === selection.plate;
        return dateMatch && vehicleMatch;
      });

      setReportData(filtered);
      if (filtered.length === 0) toast.info("No records found");
      else toast.success(`Found ${filtered.length} records`);
    } catch (err) {
      toast.error("Error generating report");
    } finally {
      setLoading(false);
    }
  };

  const totalCost = reportData.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0,
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <div
        className="p-4 space-y-6 animate-in fade-in duration-700"
        style={{ fontFamily: themeFont }}
      >
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-3xl border border-slate-100 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 rounded-xl shadow-md">
              <Wrench className="text-yellow-400" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
                Maintenance Cost Report
              </h1>
              <p className="text-slate-500 font-medium italic mt-1 text-[10px]">
                Financial analysis of fleet repairs.
              </p>
            </div>
          </div>

          {reportData.length > 0 && (
            <button
              onClick={() => handlePrint()}
              className="bg-slate-900 text-yellow-400 h-11 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <Printer size={16} /> Print Report
            </button>
          )}
        </header>

        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="label-style">Target Vehicle</label>
            <Autocomplete
              size="small"
              options={vehicles}
              value={selection.plate}
              onChange={(e, val) =>
                setSelection({ ...selection, plate: val || "All Vehicles" })
              }
              renderInput={(params) => (
                <TextField {...params} placeholder="Search..." />
              )}
            />
          </div>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="flex flex-col gap-1.5">
              <label className="label-style">Date From</label>
              <DatePicker
                value={selection.start}
                onChange={(v) => setSelection({ ...selection, start: v })}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label-style">Date To</label>
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
            className="h-10 bg-slate-900 text-yellow-400 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <FileSearch size={16} />
            )}
            Fetch Records
          </button>
        </div>

        {/* RESULTS SECTION */}
        {reportData.length > 0 && (
          <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
            <div className="bg-slate-900 px-8 py-5 rounded-[1.5rem] text-white flex justify-between items-center shadow-lg border border-slate-800">
              <div>
                <p className="text-yellow-400 text-[9px] font-bold uppercase tracking-[0.15em] mb-0.5">
                  Total Maintenance Cost
                </p>
                <h2 className="text-2xl font-bold tracking-tight">
                  LKR{" "}
                  {totalCost.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.15em] mb-0.5">
                  Vehicle Scope
                </p>
                <h2 className="text-xl font-bold text-white">
                  {selection.plate}
                </h2>
              </div>
            </div>

            {/* PRINTABLE AREA WITH REDUCED MARGINS */}
            <div
              ref={reportRef}
              className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden p-2 print:p-4 print:w-full"
            >
              <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-4 text-center">
                <h1 className="text-2xl font-bold uppercase">
                  Maintenance Cost Report
                </h1>
                <p className="text-sm font-medium text-slate-500">
                  Period: {selection.start.format("DD/MM/YYYY")} -{" "}
                  {selection.end.format("DD/MM/YYYY")} | Vehicle:{" "}
                  {selection.plate}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse print:table-fixed">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                    <tr>
                      <th className="px-4 py-4 print:px-2">Date</th>
                      <th className="px-4 py-4 print:px-2">Vehicle</th>
                      <th className="px-4 py-4 print:px-2">Driver</th>
                      <th className="px-4 py-4 print:px-2">Description</th>
                      <th className="px-4 py-4 text-right print:px-2">
                        Cost (LKR)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.map((item, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50/50 transition-all group"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-slate-600 print:text-xs print:px-2">
                          {dayjs(item.date).format("DD/MM/YYYY")}
                        </td>
                        <td className="px-4 py-4 print:px-2">
                          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase print:bg-transparent print:border print:border-slate-200">
                            {item.vehicleNo}
                          </span>
                        </td>
                        <td className="px-4 py-4 print:px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-slate-900 print:hidden">
                              <User size={10} />
                            </div>
                            <span className="text-sm font-medium text-slate-700 italic print:text-xs">
                              {item.driver || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-slate-800 print:text-xs print:px-2">
                          {item.description}
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-slate-900 print:text-xs print:px-2">
                          {Number(item.amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900 text-white font-bold hidden print:table-row">
                      <td
                        colSpan="4"
                        className="px-4 py-4 text-right uppercase text-[10px]"
                      >
                        Grand Total
                      </td>
                      <td className="px-4 py-4 text-right">
                        {totalCost.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
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
        .label-style { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-left: 2px; }
        @media print {
            @page { 
              size: auto; 
              margin: 10mm 5mm !important; /* REDUCED SIDE MARGINS */
            }
            body { 
              -webkit-print-color-adjust: exact; 
              padding: 0 !important;
              margin: 0 !important;
            }
            .print\\:p-4 { padding: 1rem !important; }
            .bg-white { box-shadow: none !important; border: none !important; }
            table { width: 100% !important; }
        }
      `,
        }}
      />
    </ThemeProvider>
  );
}
