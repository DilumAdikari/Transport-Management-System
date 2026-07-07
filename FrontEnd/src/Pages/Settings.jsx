import { useEffect, useState } from "react";
import API from "../api";
import { toast } from "sonner";
import { 
  Settings as SettingsIcon, ShieldCheck, UserCog, Truck, 
  Save, X, Loader2, Edit3, Search, Calendar, Fingerprint, 
  Settings2, Fuel, Smartphone, BadgeCheck, Building2, Plus, Trash2, AlertTriangle, Banknote
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ users: [], drivers: [], vehicles: [], departments: [] });
  const [editModal, setEditModal] = useState(null);
  
  // Modern Alert States
  const [deleteConfirm, setDeleteConfirm] = useState(null); // Stores ID of dept to delete
  
  const [newDept, setNewDept] = useState({ name: "", code: "" });
  const themeFont = '"Inter", "Open Sans", "Segoe UI", system-ui, sans-serif';

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, d, v, dep] = await Promise.all([
        API.get("/users"), API.get("/drivers"), API.get("/vehicles"), API.get("/departments")
      ]);
      setData({ users: u.data || [], drivers: d.data || [], vehicles: v.data || [], departments: dep.data || [] });
    } catch (err) { toast.error("Sync Error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const endpoint = editModal.type === 'user' ? `/users/change-password/${editModal._id}` : `/${editModal.type}s/${editModal._id}`;
    try {
      await API.put(endpoint, editModal);
      toast.success("Database Updated Successfully");
      setEditModal(null);
      loadData();
    } catch (err) { toast.error("Update Failed"); }
  };

  const handleAddDept = async () => {
    if(!newDept.name) return toast.error("Department Name is required");
    try {
      await API.post("/departments", newDept);
      toast.success("Department Added");
      setNewDept({ name: "", code: "" });
      loadData();
    } catch (err) { toast.error("Failed to add department"); }
  };

  const confirmDeleteDept = async () => {
    try {
      await API.delete(`/departments/${deleteConfirm}`);
      toast.success("Department Removed");
      setDeleteConfirm(null);
      loadData();
    } catch (err) { toast.error("Error deleting department"); }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline text-yellow-600" size={40} /></div>;

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20" style={{ fontFamily: themeFont }}>
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-yellow-400 rounded-lg shadow-md"><SettingsIcon size={20}/></div> Master Database Management
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review & Modify All System Assets</p>
        </div>
      </header>

      <div className="flex gap-4 border-b border-slate-100 pb-4 overflow-x-auto custom-scrollbar">
        <TabBtn id="users" label="Users" icon={<ShieldCheck size={18}/>} active={activeTab} set={setActiveTab} />
        <TabBtn id="drivers" label="Drivers" icon={<UserCog size={18}/>} active={activeTab} set={setActiveTab} />
        <TabBtn id="vehicles" label="Vehicles" icon={<Truck size={18}/>} active={activeTab} set={setActiveTab} />
        <TabBtn id="depts" label="Departments" icon={<Building2 size={18}/>} active={activeTab} set={setActiveTab} />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">{activeTab} Details List</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase"><Search size={14}/> Real-time Sync Active</div>
        </div>

        {activeTab === "depts" ? (
          <div className="p-10 animate-in fade-in duration-500">
            <div className="max-w-2xl space-y-6 mb-12">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Register New Department</h3>
              <div className="flex gap-3">
                <div className="form-group flex-1"><input placeholder="Department Name (e.g. Production)" value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} /></div>
                <div className="form-group w-32"><input placeholder="Code" value={newDept.code} onChange={e => setNewDept({...newDept, code: e.target.value})} /></div>
                <button onClick={handleAddDept} className="bg-slate-900 text-yellow-400 px-6 rounded-2xl hover:scale-105 transition-all shadow-lg flex items-center gap-2 font-bold text-xs uppercase tracking-widest"><Plus size={18}/> Add</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.departments.map(dept => (
                <div key={dept._id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center group hover:border-yellow-400 transition-all">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{dept.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{dept.code || 'N/A'}</p>
                  </div>
                  <button onClick={() => setDeleteConfirm(dept._id)} className="p-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  {activeTab === "users" && <><th className="px-8 py-6">Full Name</th><th className="px-8 py-6">Username</th><th className="px-8 py-6">Role</th><th className="px-8 py-6">ID</th></>}
                  {activeTab === "drivers" && <><th className="px-8 py-6">Name</th><th className="px-8 py-6">Phone</th><th className="px-8 py-6">License</th><th className="px-8 py-6">Exp</th><th className="px-8 py-6">Emission</th></>}
                  {activeTab === "vehicles" && (
                    <>
                      <th className="px-8 py-6">Plate</th>
                      <th className="px-8 py-6">Brand</th>
                      <th className="px-8 py-6 text-yellow-600">Cost (1KM)</th> {/* NEW COLUMN HEADER */}
                      <th className="px-8 py-6">Technical</th>
                      <th className="px-8 py-6">Fuel</th>
                    </>
                  )}
                  <th className="px-8 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-[13px] font-semibold divide-y divide-slate-50">
                {activeTab === "users" && data.users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-5 text-slate-900">{u.name}</td>
                    <td className="px-8 py-5 text-slate-500">{u.username}</td>
                    <td className="px-8 py-5"><span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold ${u.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{u.role}</span></td>
                    <td className="px-8 py-5 text-slate-300 font-mono text-[11px]">{u._id}</td>
                    <td className="px-8 py-5 text-right"><button onClick={() => setEditModal({...u, type: 'user'})} className="edit-btn"><Edit3 size={14}/></button></td>
                  </tr>
                ))}
                {activeTab === "drivers" && data.drivers.map(d => (
                  <tr key={d._id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-5 text-slate-900">{d.name}</td>
                    <td className="px-8 py-5 text-slate-500 flex items-center gap-2"><Smartphone size={14} className="text-slate-300"/>{d.phone}</td>
                    <td className="px-8 py-5 text-slate-500 tracking-tighter"><BadgeCheck size={14} className="inline mr-2 text-blue-400"/>{d.licenseNo || '--'}</td>
                    <td className="px-8 py-5 font-bold text-red-500 text-[11px]">{d.licenseExpire || 'N/A'}</td>
                    <td className="px-8 py-5 font-bold text-emerald-500 text-[11px]">{d.emissionValid || 'N/A'}</td>
                    <td className="px-8 py-5 text-right"><button onClick={() => setEditModal({...d, type: 'driver'})} className="edit-btn"><Edit3 size={14}/></button></td>
                  </tr>
                ))}
                {activeTab === "vehicles" && data.vehicles.map(v => (
                  <tr key={v._id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-5 text-slate-900 font-bold uppercase tracking-tight">{v.plateNumber}</td>
                    <td className="px-8 py-5 text-slate-500">{v.brand} {v.modelName}</td>
                    {/* NEW COLUMN DATA */}
                    <td className="px-8 py-5 text-yellow-700 font-black">
                        Rs. {(Number(v.pricePerKM) || 0).toFixed(2)}
                    </td>
                    <td className="px-8 py-5 text-slate-400 text-[10px] tracking-tight font-medium">C: {v.chassisNo || '--'}<br/>E: {v.engineNo || '--'}</td>
                    <td className="px-8 py-5 uppercase text-[10px] text-slate-400 font-bold"><Fuel size={12} className="inline mr-1"/>{v.fuelType} | {v.yom}</td>
                    <td className="px-8 py-5 text-right"><button onClick={() => setEditModal({...v, type: 'vehicle'})} className="edit-btn"><Edit3 size={14}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODERN DELETE CONFIRMATION --- */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Are you sure?</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                Do you really want to delete this department? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={confirmDeleteDept} className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-200">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EDIT MODAL --- */}
      <AnimatePresence>
        {editModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
                <h3 className="font-bold uppercase text-sm tracking-widest flex items-center gap-3"><Edit3 size={18} className="text-yellow-400"/> Modify {editModal.type}</h3>
                <button onClick={() => setEditModal(null)} className="p-2 bg-white/10 rounded-full hover:bg-red-500 transition-all"><X size={18}/></button>
              </div>
              <form onSubmit={handleUpdate} className="p-10 space-y-5">
                <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto px-2 custom-scrollbar">
                    {editModal.type === 'user' ? (
                        <div className="form-group"><label>Reset Password</label><input type="password" onChange={e => setEditModal({...editModal, password: e.target.value})} placeholder="••••••••" /></div>
                    ) : (
                        Object.keys(editModal).filter(k => !['_id', '__v', 'createdAt', 'updatedAt', 'type'].includes(k)).map(key => (
                            <div key={key} className="form-group">
                                <label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                                <input 
                                    type={key === 'pricePerKM' ? 'number' : 'text'}
                                    value={editModal[key] || ''} 
                                    onChange={e => setEditModal({...editModal, [key]: e.target.value})} 
                                />
                            </div>
                        ))
                    )}
                </div>
                <button type="submit" className="w-full py-5 bg-yellow-400 text-slate-900 rounded-2xl font-bold uppercase text-[11px] tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"><Save size={18}/> Commit Changes</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .edit-btn { p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; }
        .form-group input { height: 50px; padding: 0 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; outline: none; font-weight: 600; color: #1e293b; transition: 0.3s; }
        .form-group input:focus { border-color: #eab308; background: white; }
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}

function TabBtn({ id, icon, label, active, set }) {
  const isActive = active === id;
  return (
    <button onClick={() => set(id)} className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all shrink-0 ${isActive ? "bg-slate-900 text-yellow-400 shadow-lg" : "text-slate-400 hover:bg-slate-100"}`}>
      {icon} {label}
    </button>
  );
}