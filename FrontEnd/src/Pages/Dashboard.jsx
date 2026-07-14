import { useState, useEffect } from "react";
import { Routes, Route, NavLink, useNavigate, Navigate, useLocation } from "react-router-dom";
import API from "../api";
import Tours from "./Tours";
import AddTour from "./AddTour";
import Management from "./Management";
import Reports from "./Reports"; 
import DriverReport from "./DriverReport";
import UserManagement from "./UserManagement";
import AddMaintenance from "./AddMaintenance";
import FuelManagement from "./FuelManagement";
import VehicleDistanceReport from "./VehicleDistanceReport";
import MaintenanceReport from "./MaintenanceReport";
import DepartmentReport from "./DepartmentReport";
import Settings from "./Settings";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { 
  LayoutDashboard, Map, PlusSquare, Package, Clock, CheckCircle2, 
  Box, PieChart as PieIcon, BarChart3, LogOut, ShieldCheck, 
  ChevronDown, FileText, UserCheck, History, UserPlus, Wrench, Fuel, Activity, Banknote,
  Settings as SettingsIcon, Bell, Check, Info, X, AlertTriangle, Menu 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard({ user, setUser }) {
  const [tours, setTours] = useState([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [showNotes, setShowNotes] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const themeFont = 'sans-serif'; // 🎯 FIXED: Locked to standard clean sans-serif
  const isAdmin = user?.role === "admin";

  const loadTours = async () => {
    try {
      const res = await API.get("/tours");
      let allData = res.data || [];
      // 🎯 FIXED: Everyone can see all tour records seamlessly now
      setTours(allData);
    } catch (error) { console.error("Error loading tours:", error); }
  };

  const loadNotifications = async () => {
    try {
      const res = await API.get(`/notifications/${user.username}`);
      setNotifications(res.data || []);
    } catch (error) { console.error("Note sync error"); }
  };

  const markNotesRead = async () => {
    try {
      await API.put(`/notifications/read/${user.username}`);
      loadNotifications();
    } catch (error) { console.error("Read update failed"); }
  };

  useEffect(() => { 
    loadTours(); 
    loadNotifications();
    const interval = setInterval(() => loadNotifications(), 15000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    setUser(null); 
    navigate("/login");
  };

  const deptData = tours.reduce((acc, curr) => {
    const dept = curr.department || "Other";
    const existing = acc.find(item => item.name === dept);
    if (existing) existing.value += 1;
    else acc.push({ name: dept, value: 1 });
    return acc;
  }, []);

  const statusData = [
    { name: "Pending", total: tours.filter(t => t.status === "Pending").length },
    { name: "Allocated", total: tours.filter(t => t.status === "Allocated").length }
  ];

  const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444"];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]" style={{ fontFamily: themeFont }}>
      
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      {/* 🎯 FIXED: Original bg-yellow-400 retained. Removed shadow-2xl, added simple border layout */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] lg:relative lg:flex flex-col bg-yellow-400 border-r border-yellow-500 p-6 
        transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"}
        ${isSidebarExpanded ? "lg:w-72" : "lg:w-20"}
      `}
      onMouseEnter={() => setIsSidebarExpanded(true)}
      onMouseLeave={() => { setIsSidebarExpanded(false); setReportOpen(false); }}
      >
        {/* 🎯 FIXED: Shadow-lg removed from icon wrapper container */}
        <div className={`flex items-center mb-12 ${isSidebarExpanded || isMobileMenuOpen ? "gap-3 px-2" : "justify-center"}`}>
          <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center shrink-0">
            <Box className="text-yellow-400" size={24} />
          </div>
          {/* 🎯 FIXED: font-bold removed, size increased to text-2.5xl */}
          {(isSidebarExpanded || isMobileMenuOpen) && <h2 className="text-2.5xl font-medium tracking-tight text-slate-900 leading-none">TMS<span className="text-white">.</span></h2>}
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
          <MenuLink to="/dashboard" icon={<LayoutDashboard size={18}/>} label="Dashboard" expanded={isSidebarExpanded || isMobileMenuOpen} end />
          <MenuLink to="/dashboard/tours" icon={<Map size={18}/>} label="All Requests" expanded={isSidebarExpanded || isMobileMenuOpen} />
          {(user.role === "user" || user.role === "admin") && (
            <MenuLink to="/dashboard/add" icon={<PlusSquare size={18}/>} label="New Request" expanded={isSidebarExpanded || isMobileMenuOpen} />
          )}

          {isAdmin && (
            <>
              <div className="pt-5 pb-2">
                {/* 🎯 FIXED: Stripped uppercase, bold styling, opacity-60 removed */}
                {(isSidebarExpanded || isMobileMenuOpen) ? <p className="text-xs font-medium text-slate-700 ml-4 tracking-wide">Administration</p> : <div className="h-px bg-slate-900/10 mx-2" />}
              </div>
              <MenuLink to="/dashboard/management" icon={<ShieldCheck size={18}/>} label="Fleet Management" expanded={isSidebarExpanded || isMobileMenuOpen} />
              <MenuLink to="/dashboard/users" icon={<UserPlus size={18}/>} label="User Control" expanded={isSidebarExpanded || isMobileMenuOpen} />
              <MenuLink to="/dashboard/maintenance" icon={<Wrench size={18}/>} label="Maintenance" expanded={isSidebarExpanded || isMobileMenuOpen} />
              <MenuLink to="/dashboard/fuel" icon={<Fuel size={18}/>} label="Fuel Tracking" expanded={isSidebarExpanded || isMobileMenuOpen} />
              
              {/* SYSTEM SETTINGS */}
              <MenuLink to="/dashboard/settings" icon={<SettingsIcon size={18}/>} label="System Settings" expanded={isSidebarExpanded || isMobileMenuOpen} />

              <div className="space-y-1">
                {/* 🎯 FIXED: font-semibold removed, original hover:bg-yellow-500 preserved */}
                <button onClick={() => setReportOpen(!reportOpen)} className={`w-full flex items-center ${(isSidebarExpanded || isMobileMenuOpen) ? "justify-between px-4" : "justify-center px-0"} py-3 rounded-xl text-sm font-medium text-slate-800 hover:bg-yellow-500 transition-all`}>
                  <div className="flex items-center gap-4"><FileText size={18} /> {(isSidebarExpanded || isMobileMenuOpen) && <span>Reports Hub</span>}</div>
                  {(isSidebarExpanded || isMobileMenuOpen) && <ChevronDown size={14} className={`transition-transform duration-300 ${reportOpen ? "rotate-180" : ""}`} />}
                </button>
                {reportOpen && (isSidebarExpanded || isMobileMenuOpen) && (
                  <div className="pl-6 space-y-1 animate-in slide-in-from-top-2 duration-300">
                    <MenuLink to="/dashboard/reports" icon={<PieIcon size={14}/>} label="Usage" expanded={true} />
                    <MenuLink to="/dashboard/driver-reports" icon={<History size={14}/>} label="Journeys" expanded={true} />
                    <MenuLink to="/dashboard/vehicle-distance" icon={<Activity size={14}/>} label="Distance" expanded={true} />
                    <MenuLink to="/dashboard/maintenance-report" icon={<Wrench size={14}/>} label="Costs" expanded={true} />
                    <MenuLink to="/dashboard/dept-report" icon={<Banknote size={14}/>} label="Dept. Costs" expanded={true} />
                  </div>
                )}
              </div>
            </>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-900/10 space-y-4">
            {/* 🎯 FIXED: font-bold, shadow-lg stripped from logout container view */}
            <button onClick={handleLogout} className={`w-full flex items-center justify-center gap-3 ${(isSidebarExpanded || isMobileMenuOpen) ? "px-4 py-3.5" : "h-12 w-12 mx-auto"} bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all`}>
                <LogOut size={16} /> {(isSidebarExpanded || isMobileMenuOpen) && <span className="text-xs tracking-wide">Logout</span>}
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar">
        
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                <Menu size={24} />
              </button>
              <div className="flex flex-col">
                {/* 🎯 FIXED: font-black and uppercase tags stripped safely */}
                <span className="text-xs font-medium text-slate-400 tracking-wide mb-1">Transport system</span>
                <h2 className="text-base font-medium text-slate-800 tracking-tight leading-none">Elisha Clothing</h2>
              </div>
            </div>

            <div className="relative">
                <button onClick={() => { setShowNotes(!showNotes); if(!showNotes) markNotesRead(); }} className="p-2 md:p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all relative">
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="absolute top-1 md:top-2 right-1 md:right-2 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-medium">{unreadCount}</span>}
                </button>

                <AnimatePresence>
                  {showNotes && (
                    /* 🎯 FIXED: Shadow-2xl removed, converted into standard clean border */
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-[280px] md:w-80 bg-white rounded-3xl border border-slate-100 overflow-hidden z-50">
                        <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            {/* 🎯 FIXED: font-black and uppercase features stripped */}
                            <span className="text-xs font-medium text-slate-800 tracking-wide">Inbox</span>
                            <button onClick={() => setShowNotes(false)}><X size={14} className="text-slate-300"/></button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            {notifications.length > 0 ? notifications.map(note => {
                                const isCritical = note.message.includes('CRITICAL');
                                return (
                                  <div key={note._id} className={`p-4 border-b border-slate-50 flex gap-3 transition-all hover:bg-slate-50 ${isCritical ? 'bg-red-50/80 hover:bg-red-100/90' : (!note.isRead ? 'bg-yellow-50/30' : '')}`}>
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCritical ? 'bg-red-500 text-white animate-pulse' : (!note.isRead ? 'bg-yellow-400 text-slate-900' : 'bg-slate-100 text-slate-400')}`}>
                                          {isCritical ? <AlertTriangle size={14}/> : (note.message.includes('Allotted') ? <Check size={14}/> : <Info size={14}/>)}
                                      </div>
                                      <div className="flex-1">
                                          {/* 🎯 FIXED: font-bold/critical styles customized to non-bold layout properties */}
                                          <p className={`text-xs font-medium leading-tight ${isCritical ? 'text-red-700' : 'text-slate-700'}`}>{note.message}</p>
                                          <p className={`text-[10px] font-medium mt-1 tracking-normal ${isCritical ? 'text-red-400' : 'text-slate-400'}`}>{new Date(note.createdAt).toLocaleTimeString()}</p>
                                      </div>
                                  </div>
                                );
                            }) : <div className="p-10 text-center text-slate-300 text-xs font-medium tracking-wide italic">No new alerts</div>}
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
        </header>

        <div className="p-4 md:p-12">
          <Routes>
            <Route path="/" element={
              <div className="animate-in fade-in duration-700">
                {/* 🎯 FIXED: font-bold tags stripped safely */}
                <header className="mb-6 md:mb-10"><h1 className="text-2.5xl font-medium text-slate-800 tracking-tight">Fleet analytics</h1></header>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10">
                  <StatCard label="Total requests" value={tours.length} icon={Package} color="text-indigo-600" bg="bg-indigo-50" />
                  <StatCard label="Pending requests" value={tours.filter(t => t.status === "Pending").length} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
                  <StatCard label="Allocated requests" value={tours.filter(t => t.status === "Allocated").length} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                  {/* 🎯 FIXED: shadow-sm removed from chart container boxes */}
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200/60 min-h-[350px]">
                    {/* 🎯 FIXED: font-bold and uppercase structural rules stripped */}
                    <h3 className="font-medium mb-6 text-slate-500 flex items-center gap-2 tracking-wide text-xs opacity-80"><PieIcon size={16}/> Department distribution</h3>
                    <div className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={deptData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{deptData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
                  </div>
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200/60 min-h-[350px]">
                    <h3 className="font-medium mb-6 text-slate-500 flex items-center gap-2 tracking-wide text-xs opacity-80"><BarChart3 size={16}/> Request status</h3>
                    <div className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={statusData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#f8fafc' }} /><Bar dataKey="total" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} /></BarChart></ResponsiveContainer></div>
                  </div>
                </div>
              </div>
            } />

            <Route path="tours" element={<Tours user={user} refresh={loadTours} />} />
            <Route path="management" element={isAdmin ? <Management refresh={loadTours} /> : <Navigate to="/dashboard" />} />
            <Route path="reports" element={isAdmin ? <Reports /> : <Navigate to="/dashboard" />} />
            <Route path="driver-reports" element={isAdmin ? <DriverReport /> : <Navigate to="/dashboard" />} />
            <Route path="vehicle-distance" element={isAdmin ? <VehicleDistanceReport /> : <Navigate to="/dashboard" />} />
            <Route path="maintenance-report" element={isAdmin ? <MaintenanceReport /> : <Navigate to="/dashboard" />} />
            <Route path="dept-report" element={isAdmin ? <DepartmentReport /> : <Navigate to="/dashboard" />} />
            <Route path="users" element={isAdmin ? <UserManagement /> : <Navigate to="/dashboard" />} />
            <Route path="maintenance" element={isAdmin ? <AddMaintenance /> : <Navigate to="/dashboard" />} />
            <Route path="fuel" element={isAdmin ? <FuelManagement /> : <Navigate to="/dashboard" />} />
            <Route path="settings" element={isAdmin ? <Settings /> : <Navigate to="/dashboard" />} />
            <Route path="add" element={(user.role === "user" || isAdmin) ? <AddTour user={user} refresh={loadTours} /> : <Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function MenuLink({ to, icon, label, expanded, end = false }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) =>
      `flex items-center ${expanded ? "gap-4 px-4" : "justify-center px-0"} py-3 rounded-xl text-sm font-medium transition-all ${
        /* 🎯 FIXED: Original background and text yellow alignments preserved (shadow-lg removed) */
        isActive ? "bg-slate-900 text-yellow-400" : "text-slate-800 hover:bg-yellow-500"
      }`
    }>
      <div className="shrink-0">{icon}</div>
      {expanded && <span className="truncate animate-in fade-in duration-300">{label}</span>}
    </NavLink>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    /* 🎯 FIXED: Card made flat (no shadow-sm), font weights updated to scale sizes smoothly */
    <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200/60 flex flex-col md:block items-center text-center md:text-left transition-all">
      <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl ${bg} ${color} flex items-center justify-center mb-3 md:mb-4`}><Icon size={20} /></div>
      <p className="text-3xl font-medium text-slate-800 tracking-tight leading-none">{value}</p>
      <p className="text-xs font-medium text-slate-400 mt-2">{label}</p>
    </div>
  );
}