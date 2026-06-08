import React, { useState, useEffect } from "react";
import API from "../api";
import {
  UserPlus,
  User,
  Lock,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  KeyRound,
  Loader2,
  Sparkles,
  Building2,
  ChevronDown,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserManagement() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "user",
    department: "",
  });

  const [departments, setDepartments] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const themeFont =
    '"Inter", "Open Sans", "Segoe UI", -apple-system, sans-serif';

  useEffect(() => {
    const loadDepts = async () => {
      try {
        const res = await API.get("/departments");
        setDepartments(res.data || []);
      } catch (err) {
        console.error("Failed to load departments");
      }
    };
    loadDepts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.department)
      return setStatus({
        type: "error",
        message: "Please select a department",
      });

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await API.post("/users", formData);
      setStatus({
        type: "success",
        message: res.data.message || "Staff member authorized successfully!",
      });
      setFormData({
        name: "",
        username: "",
        password: "",
        role: "user",
        department: "",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Registration failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 pb-20"
      style={{ fontFamily: themeFont }}
    >
      {/* PAGE HEADER */}
      <header className="mb-10 flex items-center gap-4">
        <div className="p-3 bg-slate-900 rounded-2xl shadow-xl">
          <Sparkles className="text-yellow-400" size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
            User Access Control
          </h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest opacity-70">
            Security Protocol & Staff Registration
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REGISTRATION FORM */}
        <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputGroup
              label="Full Employee Name"
              icon={<User size={18} />}
              type="text"
              placeholder="e.g. Saman Kumara"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup
                label="System Username"
                icon={<UserCheck size={18} />}
                type="text"
                placeholder="e.g. saman_tms"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />

              <InputGroup
                label="Secure Password"
                icon={<Lock size={18} />}
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MODERN ROLE DROPDOWN */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
                  Assign System Role
                </label>
                <div
                  onClick={() => {
                    setRoleDropdownOpen(!roleDropdownOpen);
                    setDeptDropdownOpen(false);
                  }}
                  className={`flex items-center gap-4 w-full p-4 bg-slate-50 rounded-2xl cursor-pointer transition-all border-2 ${roleDropdownOpen ? "border-slate-900 bg-white" : "border-transparent"}`}
                >
                  <KeyRound className="text-slate-400" size={18} />
                  <span className="text-xs font-bold text-slate-700 flex-1">
                    {formData.role === "admin"
                      ? "System Admin (Full Access)"
                      : "Standard User (Requests Only)"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform ${roleDropdownOpen ? "rotate-180" : ""}`}
                  />
                </div>
                <AnimatePresence>
                  {roleDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-[105%] left-0 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2"
                    >
                      <div
                        onClick={() => {
                          setFormData({ ...formData, role: "user" });
                          setRoleDropdownOpen(false);
                        }}
                        className="px-5 py-3 text-xs font-bold text-slate-600 hover:bg-yellow-400 hover:text-slate-900 cursor-pointer transition-colors"
                      >
                        Standard User (Requests Only)
                      </div>
                      <div
                        onClick={() => {
                          setFormData({ ...formData, role: "admin" });
                          setRoleDropdownOpen(false);
                        }}
                        className="px-5 py-3 text-xs font-bold text-slate-600 hover:bg-yellow-400 hover:text-slate-900 cursor-pointer transition-colors"
                      >
                        System Admin (Full Access)
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* MODERN DEPARTMENT DROPDOWN */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
                  Allocate Department
                </label>
                <div
                  onClick={() => {
                    setDeptDropdownOpen(!deptDropdownOpen);
                    setRoleDropdownOpen(false);
                  }}
                  className={`flex items-center gap-4 w-full p-4 bg-slate-50 rounded-2xl cursor-pointer transition-all border-2 ${deptDropdownOpen ? "border-yellow-400 bg-white shadow-lg" : "border-transparent"}`}
                >
                  <Building2
                    className={`${deptDropdownOpen ? "text-yellow-500" : "text-slate-400"}`}
                    size={18}
                  />
                  <span
                    className={`text-xs font-bold flex-1 ${formData.department ? "text-slate-700" : "text-slate-400"}`}
                  >
                    {formData.department || "Choose Department..."}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform ${deptDropdownOpen ? "rotate-180" : ""}`}
                  />
                </div>
                <AnimatePresence>
                  {deptDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-[105%] left-0 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 max-h-48 overflow-y-auto"
                    >
                      {departments.map((dept) => (
                        <div
                          key={dept._id}
                          onClick={() => {
                            setFormData({ ...formData, department: dept.name });
                            setDeptDropdownOpen(false);
                          }}
                          className="px-5 py-3 text-xs font-bold text-slate-600 hover:bg-yellow-400 hover:text-slate-900 cursor-pointer transition-colors flex items-center gap-3"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />{" "}
                          {dept.name}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* STATUS MESSAGES */}
            {status.message && (
              <div
                className={`p-4 rounded-2xl flex items-center gap-3 ${status.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <p className="text-[11px] font-black uppercase tracking-tight">
                  {status.message}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-slate-900 text-yellow-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <UserPlus size={18} /> Authorize & Register Staff
                </>
              )}
            </button>
          </form>
        </div>

        {/* SIDE GUIDE */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-slate-900 shadow-lg">
                <ShieldAlert size={20} />
              </div>
              <h4 className="text-white font-black text-lg uppercase tracking-tighter">
                Access Guide
              </h4>
            </div>

            <div className="space-y-6">
              <div className="border-l-4 border-yellow-400 pl-4">
                <p className="text-xs font-black text-white uppercase tracking-widest">
                  Admin Role
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-bold leading-relaxed">
                  Full control: Fleet management, financial reports, and user
                  security control.
                </p>
              </div>
              <div className="border-l-4 border-slate-600 pl-4">
                <p className="text-xs font-black text-white uppercase tracking-widest">
                  Staff Role
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-bold leading-relaxed">
                  Standard access: Restricted to creating and tracking their own
                  journey requests.
                </p>
              </div>
              <div className="border-l-4 border-emerald-500 pl-4">
                <p className="text-xs font-black text-white uppercase tracking-widest">
                  Dept. Locking
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-bold leading-relaxed">
                  Users are hard-coded to their department to prevent cross-dept
                  billing errors.
                </p>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800 text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
                TMS Security Protocol v2.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, icon, ...props }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <input
          {...props}
          className="w-full pl-12 p-4 bg-slate-50 rounded-2xl font-bold text-xs outline-none border-2 border-transparent focus:border-yellow-500 focus:bg-white transition-all shadow-inner text-slate-700 placeholder:text-slate-300"
          required
        />
      </div>
    </div>
  );
}
