import { useState, useEffect } from "react";
import API from "../api";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, MessageSquare, Send, Loader2, CheckCircle, Sparkles, Building2, Calendar, Clock, Lock } from "lucide-react";
import { toast } from "sonner";

// --- MODERN MUI PICKER IMPORTS ---
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from 'dayjs';
import { createTheme, ThemeProvider, Autocomplete, TextField } from '@mui/material';

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
          borderRadius: '1.2rem',
          padding: '4px',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
          marginTop: '8px',
          border: '1px solid #f1f5f9'
        }
      }
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            padding: '4px 12px !important',
            borderRadius: '1rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s',
            '& fieldset': { border: 'none' },
            '&.Mui-focused': {
              backgroundColor: '#fff',
              border: '2px solid #eab308',
            },
            '&.Mui-disabled': {
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              cursor: 'not-allowed'
            }
          }
        },
        option: {
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#334155',
          padding: '12px 16px !important',
          '&:hover': { backgroundColor: '#fef9c3 !important' }
        }
      }
    }
  }
});

export default function AddTour({ user, refresh }) {
  const isAdmin = user?.role === "admin";

  const [form, setForm] = useState({ 
    fromLocation: "", 
    toLocation: "", 
    // Auto-select department if not admin
    department: isAdmin ? "" : (user?.department || ""), 
    remark: "" 
  });
  
  const [departments, setDepartments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState(dayjs().set('hour', 8).set('minute', 0)); 
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadDepts = async () => {
      try {
        const res = await API.get("/departments");
        setDepartments(res.data || []);
      } catch (err) { console.error("Dept load error"); }
    };
    loadDepts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fromLocation || !form.toLocation || !form.department) {
        return toast.error("Missing Fields", { description: "Please fill in all travel details." });
    }

    setLoading(true);
    try {
      await API.post("/tours", {
        ...form,
        date: selectedDate.format('YYYY-MM-DD'),
        time: selectedTime.format('hh:mm A'),
        location: `${form.fromLocation} to ${form.toLocation}`,
        userName: user?.name || "Admin",
        status: "Pending",
      });

      toast.success("Request Submitted");
      setSubmitted(true);
      // Reset form but keep the locked department for non-admins
      setForm({ 
        fromLocation: "", 
        toLocation: "", 
        department: isAdmin ? "" : (user?.department || ""), 
        remark: "" 
      });
      if (refresh) refresh();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      toast.error("Submission Failed");
    } finally {
      setLoading(false);
    }
  };

  const pickerSx = {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      height: '54px',
      borderRadius: '1rem',
      backgroundColor: '#f8fafc', 
      border: '1px solid #e2e8f0',
      '& input': {
        padding: '12px 12px',
        fontSize: '0.85rem',
        fontWeight: '500',
        color: '#334155',
      },
      '& fieldset': { border: 'none' },
      '&.Mui-focused': {
          backgroundColor: '#fff',
          border: '1px solid #eab308',
      },
    },
    '& .MuiSvgIcon-root': { color: '#eab308', fontSize: '1.2rem' }
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto p-4 erp-font">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-yellow-500 rounded-2xl shadow-lg">
            <Sparkles className="text-black" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">New Journey</h1>
            <p className="text-slate-500 font-medium italic text-sm">Enter your travel details below.</p>
          </div>
        </div>

        <div className="relative bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row">
            
            <div className="flex-[2.2] p-8 lg:p-12 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <div className="space-y-1.5">
                  <label className="label-style"><MapPin size={12}/> From Location</label>
                  <input type="text" value={form.fromLocation} onChange={e => setForm({...form, fromLocation: e.target.value})} placeholder="Starting point" className="input-style" />
                </div>

                <div className="space-y-1.5">
                  <label className="label-style"><MapPin size={12}/> To Location</label>
                  <input type="text" value={form.toLocation} onChange={e => setForm({...form, toLocation: e.target.value})} placeholder="Destination" className="input-style" />
                </div>

                {/* --- DEPARTMENT LOGIC: READ-ONLY FOR USERS / SELECTABLE FOR ADMINS --- */}
                <div className="space-y-1.5">
                  <label className="label-style">
                    {isAdmin ? <Building2 size={12}/> : <Lock size={12}/>} 
                    {isAdmin ? " Department" : " Allocated Department (Locked)"}
                  </label>
                  <Autocomplete
                    options={departments.map(d => d.name)}
                    value={form.department || null}
                    disabled={!isAdmin} // Lock for regular users
                    onChange={(event, newValue) => setForm({...form, department: newValue || ""})}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        placeholder={isAdmin ? "Select Dept" : form.department} 
                      />
                    )}
                    sx={{
                        '& .MuiInputBase-input::placeholder': {
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            color: isAdmin ? '#94a3b8' : '#334155',
                            opacity: 1
                        }
                    }}
                  />
                </div>

                <div className="flex gap-4 col-span-1 md:col-span-1">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div className="flex-1 space-y-1.5 min-w-[140px]">
                      <label className="label-style"><Calendar size={12}/> Date</label>
                      <DatePicker value={selectedDate} onChange={(val) => setSelectedDate(val)} sx={pickerSx} />
                    </div>
                    <div className="flex-1 space-y-1.5 min-w-[140px]">
                      <label className="label-style"><Clock size={12}/> Time</label>
                      <TimePicker value={selectedTime} onChange={(val) => setSelectedTime(val)} viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }} sx={pickerSx} />
                    </div>
                  </LocalizationProvider>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="label-style"><MessageSquare size={12}/> Remarks</label>
                <textarea rows={2} value={form.remark} onChange={e => setForm({...form, remark: e.target.value})} placeholder="Instructions..." className="input-style resize-none" />
              </div>
            </div>

            <div className="flex-1 bg-slate-900 p-8 lg:p-12 flex flex-col justify-between border-l border-slate-800">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-lg border-l-4 border-yellow-500 pl-3">Booking Summary</h3>
                  {!isAdmin && <Lock className="text-slate-600" size={14}/>}
                </div>
                <div className="space-y-4">
                    <SummaryRow label="Requester" value={user?.name || "Admin"} />
                    <SummaryRow label="Dept" value={form.department || "---"} />
                    <SummaryRow label="Date" value={selectedDate.format('MMM DD, YYYY')} />
                    <SummaryRow label="Time" value={selectedTime.format('hh:mm A')} />
                </div>
              </div>

              <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${submitted ? "bg-emerald-500 text-white" : "bg-yellow-500 text-black hover:bg-yellow-400"} active:scale-95`}>
                <AnimatePresence mode="wait">
                  {loading ? <Loader2 className="animate-spin" /> : submitted ? <CheckCircle size={20}/> : <Send size={18} />}
                </AnimatePresence>
                {submitted ? "Success" : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .erp-font { font-family: "Inter", "Open Sans", sans-serif !important; -webkit-font-smoothing: antialiased; }
        .label-style { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-left: 4px; }
        .input-style { width: 100%; padding: 14px 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 1rem; outline: none; transition: all 0.2s; font-weight: 500; font-size: 0.85rem; color: #334155; }
        .input-style:focus { background-color: #fff; border-color: #eab308; }
      `}} />
    </ThemeProvider>
  );
}

function SummaryRow({ label, value }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-tight">{label}</span>
            <span className="text-white text-xs font-medium truncate max-w-[140px]">{value}</span>
        </div>
    )
}